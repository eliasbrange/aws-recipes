from pydantic import BaseModel


class PetResponse(BaseModel):
    id: str
    name: str
    kind: str


class CreatePayload(BaseModel):
    name: str
    kind: str


class UpdatePayload(BaseModel):
    name: str = None
    kind: str = None


class PetListResponse(BaseModel):
    pets: list[PetResponse]
    next_token: str = None
