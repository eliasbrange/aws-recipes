import os
import json
import base64
from uuid import uuid4
from datetime import datetime
import boto3
from boto3.dynamodb.conditions import And, Attr

table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])


class Error(Exception):
    pass


class InvalidTaskStateError(Error):
    pass


class TaskNotFoundError(Error):
    pass


def _get_timestamp():
    return int(datetime.utcnow().timestamp())


def create_task(task_type: str, payload: dict) -> str:
    task_id = str(uuid4())
    table.put_item(
        Item={
            "id": task_id,
            "task_type": task_type,
            "status": "CREATED",
            "payload": payload,
            "created_time": _get_timestamp(),
        }
    )

    return task_id


def get_task(task_id: str) -> dict:
    res = table.get_item(
        Key={
            "id": task_id,
        },
    )

    item = res.get("Item")
    if not item:
        raise TaskNotFoundError

    return item


def update_task(task_id: str, status: str, status_msg: str):
    cond = Attr("id").exists()

    if status == "IN_PROGRESS":
        cond = And(cond, Attr("status").eq("CREATED"))

    try:
        table.update_item(
            Key={
                "id": task_id,
            },
            UpdateExpression="set #S=:s, status_msg=:m, updated_time=:t",
            # status is reserved
            ExpressionAttributeNames={
                "#S": "status",
            },
            ExpressionAttributeValues={
                ":s": status,
                ":m": status_msg,
                ":t": _get_timestamp(),
            },
            ConditionExpression=cond,
        )
    except table.meta.client.exceptions.ConditionalCheckFailedException as e:
        raise InvalidTaskStateError


def list_tasks(next_token: str = None) -> dict:
    scan_args = {
        "Limit": 10,
    }

    if next_token:
        scan_args["ExclusiveStartKey"] = _decode_token(next_token)

    res = table.scan(**scan_args)
    response = {"tasks": res["Items"]}

    if "LastEvaluatedKey" in res:
        response["next_token"] = _encode_token(res["LastEvaluatedKey"])

    return response


def _encode_token(d: dict) -> str:
    json_string = json.dumps(d)
    return base64.b64encode(json_string.encode("utf-8")).decode("utf-8")


def _decode_token(token: str) -> dict:
    json_string = base64.b64decode(token.encode("utf-8")).decode("utf-8")
    return json.loads(json_string)
