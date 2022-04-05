import os
import json
import base64
from uuid import uuid4
import boto3
from boto3.dynamodb.conditions import Attr

table = boto3.resource("dynamodb").Table(os.environ["TABLE_NAME"])


class Error(Exception):
    pass


class PetNotFoundError(Error):
    pass


def create_pet(kind: str, name: str) -> dict:
    pet_id = str(uuid4())
    item = {
        "id": pet_id,
        "kind": kind,
        "name": name,
    }
    table.put_item(Item=item)
    return item


def get_pet(pet_id: str) -> dict:
    res = table.get_item(
        Key={
            "id": pet_id,
        },
    )

    item = res.get("Item")
    if not item:
        raise PetNotFoundError

    return item


def update_pet(pet_id: str, kind: str = None, name: str = None):
    expr = []
    attrs = {}

    if kind is not None:
        expr.append("kind=:k")
        attrs[":k"] = kind

    if name is not None:
        expr.append("name=:n")
        attrs[":n"] = name

    if not expr:
        return

    try:
        table.update_item(
            Key={
                "id": pet_id,
            },
            UpdateExpression=f"set {', '.join(expr)}",
            ExpressionAttributeValues=attrs,
            ConditionExpression=Attr("id").exists(),
        )
    except table.meta.client.exceptions.ConditionalCheckFailedException:
        raise PetNotFoundError


def list_pets(next_token: str = None) -> dict:
    scan_args = {
        "Limit": 10,
    }

    if next_token:
        scan_args["ExclusiveStartKey"] = _decode(next_token)

    res = table.scan(**scan_args)
    response = {"pets": res["Items"]}

    if "LastEvaluatedKey" in res:
        response["next_token"] = _encode(res["LastEvaluatedKey"])

    return response


def delete_pet(pet_id: str):
    table.delete_item(
        Key={
            "id": pet_id,
        }
    )


def _encode(data: dict) -> str:
    json_string = json.dumps(data)
    return base64.b64encode(json_string.encode("utf-8")).decode("utf-8")


def _decode(data: str) -> dict:
    json_string = base64.b64decode(data.encode("utf-8")).decode("utf-8")
    return json.loads(json_string)
