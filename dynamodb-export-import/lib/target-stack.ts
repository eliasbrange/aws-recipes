import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3 from "aws-cdk-lib/aws-s3";

interface TargetStackProps extends cdk.StackProps {
  sourceAccount: string;
}

export class TargetStack extends cdk.Stack {
  public readonly role: iam.Role;

  constructor(scope: Construct, id: string, props?: TargetStackProps) {
    super(scope, id, props);

    // Create Bucket that will hold exported data from Source DynamoDB
    const migrationBucket = new s3.Bucket(this, "MigrationBucket", {});

    // Allow source account to list bucket
    migrationBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AccountPrincipal(props?.sourceAccount)],
        actions: ["s3:ListBucket"],
        resources: [migrationBucket.bucketArn],
      })
    );

    // Allow source account to write to bucket
    migrationBucket.addToResourcePolicy(
      new iam.PolicyStatement({
        principals: [new iam.AccountPrincipal(props?.sourceAccount)],
        actions: ["s3:AbortMultipartUpload", "s3:PutObject", "s3:PutObjectAcl"],
        resources: [migrationBucket.arnForObjects("*")],
      })
    );

    // Role for cross-account access to new DynamoDB table
    this.role = new iam.Role(this, "CrossAccountDynamoDBRole", {
      assumedBy: new iam.AccountPrincipal(props?.sourceAccount),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
      ],
    });

    // Outputs
    new cdk.CfnOutput(this, "MigrationBucketOutput", {
      value: migrationBucket.bucketArn,
    });

    new cdk.CfnOutput(this, "CrossAccountDynamoDBRoleOutput", {
      value: this.role.roleArn,
    });
  }
}
