import * as cdk from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import type { Construct } from "constructs";

export class EventbridgeTestingWithAppsyncEventsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const eventBus = new EventBus(this, "EventBus");

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
  }
}
