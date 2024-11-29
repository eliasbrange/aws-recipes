import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as eventbridge from "aws-cdk-lib/aws-events";
import * as eventbridgeTargets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
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
    });

    new appsync.CfnChannelNamespace(this, "TestEventsNamespace", {
      apiId: this.eventsApi.attrApiId,
      name: "default",
    });

    const publishToAppSyncFn = new NodejsFunction(
      this,
      "PublishToAppSyncFunction",
      {
        entry: "src/publishToAppSync.ts",
        handler: "handler",
        runtime: lambda.Runtime.NODEJS_20_X,
        environment: {
          EVENTS_API_URL: `https://${this.eventsApi.attrDnsHttp}`,
          EVENTS_API_KEY: eventsApiKey.attrApiKey,
        },
      },
    );

    new eventbridge.Rule(this, "TestEventsRule", {
      eventBus: props.eventBus,
      eventPattern: {
        source: eventbridge.Match.prefix(""),
      },
      targets: [new eventbridgeTargets.LambdaFunction(publishToAppSyncFn)],
    });
  }
}
