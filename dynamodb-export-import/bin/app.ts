#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AppStack } from '../lib/app-stack';
import { TargetStack } from "../lib/target-stack";
import { SourceStack } from "../lib/source-stack";

const targetAccount = "111111111111";
const sourceAccount = "222222222222";
const targetRole = "ROLE_ARN";
const tableName = "MyTable";
const sourceStreamArn = "STREAM_ARN";
const importS3Bucket = "BUCKET_NAME";
const importS3Prefix = "BUCKET_PREFIX";

const app = new cdk.App();
new AppStack(app, 'AppStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  },
  targetAccount,
  importS3Bucket,
  importS3Prefix,
});
new TargetStack(app, "TargetStack", {
  env: {
    account: targetAccount,
    region: process.env.CDK_DEFAULT_REGION
  },
  sourceAccount
});
new SourceStack(app, "SourceStack", {
  env: {
    account: sourceAccount,
    region: process.env.CDK_DEFAULT_REGION
  },
  targetRole,
  tableName,
  sourceStreamArn,
});
