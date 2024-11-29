import * as cdk from "aws-cdk-lib";
import * as eventbridge from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
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
      new TestResources(this, "TestResources", { eventBus });
    }
  }
}
