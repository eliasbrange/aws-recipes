from typing import List
from fastapi import FastAPI, HTTPException
from mangum import Mangum
from . import dynamo
from pydantic import BaseModel

app = FastAPI()


class CreatePayload(BaseModel):
    task_type: str
    data: dict


class UpdatePayload(BaseModel):
    status: str
    status_msg: str = ""


class TaskModel(BaseModel):
    id: str
    task_type: str
    status: str
    status_msg: str = ""
    created_time: int = None
    updated_time: int = None


class TaskListModel(BaseModel):
    tasks: list[TaskModel]
    next_token: str = None


@app.get("/")
def get_root():
    print("test")
    return {"message": "Hello World"}


@app.get("/tasks", response_model=TaskListModel)
def list_tasks(next_token: str=None):
    return dynamo.list_tasks(next_token)


@app.get("/tasks/{task_id}", response_model=TaskModel)
def get_task(task_id: str):
    try:
        return dynamo.get_task(task_id)
    except dynamo.ItemNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.post("/tasks", status_code=201)
def post_task(payload: CreatePayload):
    print(payload)
    task_id = dynamo.create_task(payload.task_type, payload.data)
    return task_id


@app.patch("/tasks/{task_id}", status_code=204)
def update_task(task_id: str, payload: UpdatePayload):
    try:
        return dynamo.update_task(task_id, payload.status, payload.status_msg)
    except dynamo.TaskAlreadyInProgressError:
        raise HTTPException(
            status_code=400, detail="Task already in progress.")

handler = Mangum(app)
