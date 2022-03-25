from typing import Literal
from pydantic import BaseModel


task_types = Literal["TASK1", "TASK2", "TASK3"]
status_types = Literal["CREATED", "IN_PROGRESS", "COMPLETED", "FAILED"]


class CreatePayload(BaseModel):
    task_type: task_types
    data: dict


class CreateResponse(BaseModel):
    id: str


class UpdatePayload(BaseModel):
    status: status_types
    status_msg: str = ""


class GetResponse(BaseModel):
    id: str
    task_type: task_types
    status: status_types
    status_msg: str = ""
    created_time: int = None
    updated_time: int = None


class ListResponse(BaseModel):
    tasks: list[GetResponse]
    next_token: str = None
