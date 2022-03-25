from fastapi import FastAPI, HTTPException
from mangum import Mangum
from . import dynamo, models

app = FastAPI()


@app.get("/")
def get_root():
    return {"message": "Hello World"}


@app.get("/tasks", response_model=models.ListResponse)
def list_tasks(next_token: str = None):
    return dynamo.list_tasks(next_token)


@app.get("/tasks/{task_id}", response_model=models.GetResponse)
def get_task(task_id: str):
    try:
        return dynamo.get_task(task_id)
    except dynamo.TaskNotFoundError:
        raise HTTPException(status_code=404, detail="Task not found")


@app.post("/tasks", status_code=201, response_model=models.CreateResponse)
def post_task(payload: models.CreatePayload):
    return dynamo.create_task(payload.task_type, payload.data)


@app.patch("/tasks/{task_id}", status_code=204)
def update_task(task_id: str, payload: models.UpdatePayload):
    try:
        return dynamo.update_task(task_id, payload.status, payload.status_msg)
    except dynamo.InvalidTaskStateError:
        raise HTTPException(
            status_code=400, detail="Task does not exist or is already in progress."
        )


handler = Mangum(app)
