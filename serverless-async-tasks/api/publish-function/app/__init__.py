import os
import boto3
from aws_lambda_powertools.utilities.data_classes import (
    event_source,
    DynamoDBStreamEvent,
)


topic = boto3.resource("sns").Topic(os.environ["TOPIC_ARN"])


@event_source(data_class=DynamoDBStreamEvent)
def handler(event: DynamoDBStreamEvent, _):
    for record in event.records:
        task_id = record.dynamodb.keys["id"].get_value
        task_type = record.dynamodb.new_image["task_type"].get_value
        payload = record.dynamodb.new_image["payload"].get_value

        res = topic.publish(
            MessageAttributes={
                "TaskId": {
                    "DataType": "String",
                    "StringValue": task_id,
                },
                "TaskType": {
                    "DataType": "String",
                    "StringValue": task_type,
                },
            },
            Message=payload,
        )

        print(f"Message {res['MessageId']} published.")
