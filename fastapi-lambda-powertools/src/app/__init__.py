from uuid import uuid4
from fastapi import FastAPI, Request, HTTPException
from mangum import Mangum
from . import dynamo, models
from .utils import logger

app = FastAPI()


@app.middleware("http")
async def logger_middleware(request: Request, call_next):
    # Get correlation id from X-Correlation-Id header, or generate one.
    corr_id = request.headers.get("x-correlation-id", str(uuid4()))
    logger.set_correlation_id(corr_id)

    # Add some request context to logs
    ctx = {"path": request.url.path, "method": request.method}
    logger.append_keys(req=ctx)

    logger.info("Received request")
    response = await call_next(request)
    return response


@app.get("/")
def get_root():
    return {"message": "Hello World"}


@app.get("/pets", response_model=models.PetListResponse)
def list_pets(next_token: str = None):
    return dynamo.list_pets(next_token)


@app.get("/pets/{pet_id}", response_model=models.PetResponse)
def get_pet(pet_id: str):
    try:
        return dynamo.get_pet(pet_id)
    except dynamo.PetNotFoundError:
        raise HTTPException(status_code=404, detail="Pet not found")


@app.post("/pets", status_code=201, response_model=models.PetResponse)
def post_pet(payload: models.CreatePayload):
    return dynamo.create_pet(kind=payload.kind, name=payload.name)


@app.patch("/pets/{pet_id}", status_code=204)
def update_pet(pet_id: str, payload: models.UpdatePayload):
    try:
        return dynamo.update_pet(
            pet_id=pet_id,
            kind=payload.kind,
            name=payload.name,
        )
    except dynamo.PetNotFoundError:
        raise HTTPException(status_code=404, detail="Pet not found")


@app.delete("/pets/{pet_id}", status_code=204)
def delete_pet(pet_id: str):
    dynamo.delete_pet(pet_id)


handler = Mangum(app)

# Add logging
handler = logger.inject_lambda_context(handler, clear_state=True)
