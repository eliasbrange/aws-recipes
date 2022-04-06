from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse

from mangum import Mangum
from . import dynamo, models
from .router import LoggerRouteHandler
from .utils import tracer, logger, metrics, MetricUnit


app = FastAPI()
app.router.route_class = LoggerRouteHandler


@app.exception_handler(Exception)
async def validation_exception_handler(request, err):
    logger.exception("Unhandled exception")
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


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
    res = dynamo.create_pet(kind=payload.kind, name=payload.name)
    metrics.add_metric(name="CreatedPets", unit=MetricUnit.Count, value=1)
    return res


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
    try:
        dynamo.delete_pet(pet_id)
    except dynamo.PetNotFoundError:
        raise HTTPException(status_code=404, detail="Pet not found")


@app.get("/fail")
def fail():
    raise Exception


handler = Mangum(app)

# Add tracing
handler.__name__ = "handler"  # tracer requires __name__ to be set
handler = tracer.capture_lambda_handler(handler)
# Add logging
handler = logger.inject_lambda_context(handler, clear_state=True)
# Add metrics last to properly flush metrics.
handler = metrics.log_metrics(handler, capture_cold_start_metric=True)