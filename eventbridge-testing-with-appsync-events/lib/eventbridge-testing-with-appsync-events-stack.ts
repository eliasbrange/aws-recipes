import * as cdk from "aws-cdk-lib";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as eventbridge from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";
import { TestResources } from "./test-resources";

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
      memorySize: 1769,
      environment: {
        EVENT_BUS_NAME: eventBus.eventBusName,
      },
    });

    eventBus.grantPutEventsTo(apiFn);

    const api = new apigwv2.HttpApi(this, "Api");
    api.addRoutes({
      path: "/event",
      methods: [apigwv2.HttpMethod.POST],
      integration: new HttpLambdaIntegration("LambdaIntegration", apiFn),
    });

    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.url ?? "no-url",
    });

    if (props?.includeTestStack) {
      const testResources = new TestResources(this, "TestResources", {
        eventBus,
      });

      new cdk.CfnOutput(this, "EventsApiUrl", {
        value: `https://${testResources.eventsApi.attrDnsHttp}/event`,
      });
    }
  }
}
