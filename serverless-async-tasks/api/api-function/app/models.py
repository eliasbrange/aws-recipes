from pydantic import BaseModel


class CreatePayload(BaseModel):
    task_type: str
    data: dict


class CreateResponse(BaseModel):
    id: str


class UpdatePayload(BaseModel):
    status: str
    status_msg: str = ""


class GetResponse(BaseModel):
    id: str
    task_type: str
    status: str
    status_msg: str = ""
    created_time: int = None
    updated_time: int = None


class ListResponse(BaseModel):
    tasks: list[GetResponse]
    next_token: str = None
