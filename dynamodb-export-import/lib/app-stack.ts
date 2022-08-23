import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface AppStackProps extends cdk.StackProps {
  targetAccount: string;
  importS3Bucket: string;
  importS3Prefix: string;
}

export class AppStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, "Table", {
      tableName: "MyTable",
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      stream: dynamodb.StreamViewType.NEW_IMAGE,
    });

    // Outputs
    new cdk.CfnOutput(this, 'TableStreamArn', {
      value: this.table.tableStreamArn || "",
    });

    if (props.targetAccount && props.targetAccount === props.env?.account) {
      const cfnTable = this.table.node.defaultChild as dynamodb.CfnTable;

      // ImportSourceSpecification is not yet supported on Table or CfnTable
      cfnTable.addPropertyOverride(
        "ImportSourceSpecification.S3BucketSource.S3Bucket",
        props.importS3Bucket,
      );
      cfnTable.addPropertyOverride(
        "ImportSourceSpecification.S3BucketSource.S3KeyPrefix",
        props.importS3Prefix,
      );
      cfnTable.addPropertyOverride(
        "ImportSourceSpecification.InputCompressionType",
        "GZIP"
      );
      cfnTable.addPropertyOverride(
        "ImportSourceSpecification.InputFormat",
        "DYNAMODB_JSON"
      );
    }
  }
}
