from pydantic import BaseModel
from typing import Optional


class PetResponse(BaseModel):
    id: str
    name: str
    kind: str


class CreatePayload(BaseModel):
    name: str
    kind: str


class UpdatePayload(BaseModel):
    name: Optional[str]
    kind: Optional[str]


class PetListResponse(BaseModel):
    pets: list[PetResponse]
    next_token: str = None
