import * as cdk from "aws-cdk-lib";
import * as eventbridge from "aws-cdk-lib/aws-events";
import * as eventbridgeTargets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as appsync from "aws-cdk-lib/aws-appsync";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

interface StackProps extends cdk.StackProps {
  includeTestStack?: boolean;
}

export class EventbridgeTestingWithAppsyncEventsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const eventBus = new eventbridge.EventBus(this, "EventBus");

    const apiFn = new NodejsFunction(this, "ApiFunction", {
      entry: "src/api.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
    });

    eventBus.grantPutEventsTo(apiFn);

    const api = new apigateway.RestApi(this, "Api");
    api.root
      .addResource("event")
      .addMethod("POST", new apigateway.LambdaIntegration(apiFn));

    if (props?.includeTestStack) {
      createTestResources(this, eventBus);
    }
  }
}

const createTestResources = (
  scope: cdk.Stack,
  eventBus: eventbridge.IEventBus,
) => {
  const eventsApi = new appsync.CfnApi(scope, "TestEventsApi", {
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

  const eventsApiKey = new appsync.CfnApiKey(scope, "TestEventsApiKey", {
    apiId: eventsApi.attrApiId,
  });

  new appsync.CfnChannelNamespace(scope, "TestEventsNamespace", {
    apiId: eventsApi.attrApiId,
    name: "default",
  });

  const publishToAppSyncFn = new NodejsFunction(
    scope,
    "PublishToAppSyncFunction",
    {
      entry: "src/publishToAppSync.ts",
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        EVENTS_API_URL: `https://${eventsApi.attrDnsHttp}`,
        EVENTS_API_KEY: eventsApiKey.attrApiKey,
      },
    },
  );

  new eventbridge.Rule(scope, "TestEventsRule", {
    eventBus,
    eventPattern: {
      source: eventbridge.Match.prefix(""),
    },
    targets: [new eventbridgeTargets.LambdaFunction(publishToAppSyncFn)],
  });
};
