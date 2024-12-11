import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as eventbridge from "aws-cdk-lib/aws-events";
import * as eventbridgeTargets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

interface ConstructProps {
  eventBus: eventbridge.IEventBus;
}

export class TestResources extends Construct {
  public eventsApi: appsync.CfnApi;

  constructor(scope: Construct, id: string, props: ConstructProps) {
    super(scope, id);

    this.eventsApi = new appsync.CfnApi(this, "TestEventsApi", {
      name: "TestEventsApi",
      eventConfig: {
        authProviders: [
          {
            authType: "API_KEY",
          },
        ],
        connectionAuthModes: [
          {
            authType: "API_KEY",
          },
        ],
        defaultPublishAuthModes: [
          {
            authType: "API_KEY",
          },
        ],
        defaultSubscribeAuthModes: [
          {
            authType: "API_KEY",
          },
        ],
      },
    });

    const eventsApiKey = new appsync.CfnApiKey(this, "TestEventsApiKey", {
      apiId: this.eventsApi.attrApiId,
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year from now
    });

    new appsync.CfnChannelNamespace(this, "TestEventsNamespace", {
      apiId: this.eventsApi.attrApiId,
      name: "default",
    });

    const connection = new eventbridge.Connection(this, "TestEventsConnection", {
      authorization: eventbridge.Authorization.apiKey(
        "x-api-key",
        cdk.SecretValue.resourceAttribute(eventsApiKey.attrApiKey),
      ),
    });

    const stateMachine = new sfn.StateMachine(this, "TestEventsStateMachine", {
      stateMachineType: sfn.StateMachineType.EXPRESS,
      logs: {
        destination: new logs.LogGroup(this, "TestEventsStateMachineLogGroup", {
          logGroupName: "/aws/vendedlogs/states/TestEventsStateMachine",
          removalPolicy: cdk.RemovalPolicy.DESTROY,
        }),
        includeExecutionData: true,
        level: sfn.LogLevel.ALL,
      },
      definitionBody: sfn.DefinitionBody.fromString(
        JSON.stringify({
          QueryLanguage: "JSONata",
          StartAt: "PublishTestEvent",
          States: {
            PublishTestEvent: {
              Type: "Task",
              Resource: "arn:aws:states:::http:invoke",
              Arguments: {
                Method: "POST",
                Authentication: {
                  ConnectionArn: "${ConnectionArn}",
                },
                ApiEndpoint: "${ApiEndpoint}",
                RequestBody: {
                  channel: "/default/debug",
                  events: ["{% $string($states.input) %}"],
                },
              },
              End: true,
            },
          },
        }),
      ),
      definitionSubstitutions: {
        ConnectionArn: connection.connectionArn,
        ApiEndpoint: `https://${this.eventsApi.attrDnsHttp}/event`,
      },
    });

    stateMachine.role.attachInlinePolicy(
      new iam.Policy(this, "StateMachinePolicy", {
        statements: [
          new iam.PolicyStatement({
            sid: "AllowUseConnection",
            effect: iam.Effect.ALLOW,
            actions: ["events:RetrieveConnectionCredentials"],
            resources: [connection.connectionArn],
          }),
          new iam.PolicyStatement({
            sid: "AllowGetConnectionSecret",
            effect: iam.Effect.ALLOW,
            actions: ["secretsmanager:GetSecretValue", "secretsmanager:DescribeSecret"],
            resources: [connection.connectionSecretArn],
          }),
          new iam.PolicyStatement({
            sid: "AllowInvokeHTTPEndpoint",
            effect: iam.Effect.ALLOW,
            actions: ["states:InvokeHTTPEndpoint"],
            resources: ["*"],
          }),
        ],
      }),
    );

    new eventbridge.Rule(this, "TestEventsRule", {
      eventBus: props.eventBus,
      eventPattern: {
        source: eventbridge.Match.prefix(""),
      },
      targets: [new eventbridgeTargets.SfnStateMachine(stateMachine)],
    });
  }
}
