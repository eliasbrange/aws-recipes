import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { Runtime, StartingPosition } from "aws-cdk-lib/aws-lambda";
import { DynamoEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

interface SourceStackProps extends cdk.StackProps {
  targetRole: string;
  tableName: string;
  sourceStreamArn: string;
}

export class SourceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: SourceStackProps) {
    super(scope, id, props);

    const fn = new lambda.NodejsFunction(this, "StreamHandler", {
      runtime: Runtime.NODEJS_16_X,
      entry: "lib/functions/stream-handler.ts",
      memorySize: 1024,
      depsLockFilePath: "yarn.lock",
      handler: "handler",
      environment: {
        TARGET_ROLE: props.targetRole,
        TARGET_TABLE: props.tableName,
      },
    });

    // Let the Lambda function assume the role in the target account
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sts:AssumeRole"],
        resources: [props.targetRole],
      })
    );

    // Adding a stream as an event source requires a Table object.
    const sourceTable = dynamo.Table.fromTableAttributes(this, "SourceTable", {
      tableName: props.tableName,
      tableStreamArn: props.sourceStreamArn,
    });

    fn.addEventSource(
      new DynamoEventSource(sourceTable, {
        startingPosition: StartingPosition.TRIM_HORIZON,
        batchSize: 100,
        enabled: true,
      })
    );
  }
}
