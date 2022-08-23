import { DynamoDBStreamEvent } from "aws-lambda";
import { AssumeRoleCommandInput } from "@aws-sdk/client-sts";
import {
  DynamoDBClient,
  DeleteItemCommand,
  DeleteItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { fromTemporaryCredentials } from "@aws-sdk/credential-providers";

const tableName = process.env.TARGET_TABLE;

// Use STS to assume the role in target account
const params: AssumeRoleCommandInput = {
  RoleArn: process.env.TARGET_ROLE,
  RoleSessionName: "Cross-Acct-DynamoDB",
};

const client = new DynamoDBClient({
  credentials: fromTemporaryCredentials({ params }),
});

export const handler = async (event: DynamoDBStreamEvent) => {
  for (const record of event.Records) {
    if (record.eventName === "REMOVE") {
      // Item was deleted, remove it from target table
      const input: DeleteItemCommandInput = {
        TableName: tableName,
        Key: record.dynamodb?.Keys as Record<string, AttributeValue>,
      };
      await client.send(new DeleteItemCommand(input));
    } else {
      // Item was created or modified, write it to the target table
      const input: PutItemCommandInput = {
        TableName: tableName,
        Item: record.dynamodb?.NewImage as Record<string, AttributeValue>,
      };
      await client.send(new PutItemCommand(input));
    }
  }
};
