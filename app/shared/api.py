from typing import Any, Generic, TypeVar

from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel, Field

T = TypeVar("T")


class ApiSuccessResponse(BaseModel, Generic[T]):
    data: T
    message: str | None = None


class ApiMessageResponse(BaseModel):
    data: None = None
    message: str


class ApiErrorField(BaseModel):
    field: str
    message: str


class ApiErrorDetail(BaseModel):
    code: str
    message: str
    detail: str | None = None
    fields: list[ApiErrorField] = Field(default_factory=list)


class ApiErrorResponse(BaseModel):
    error: ApiErrorDetail


def build_success_response(data: Any, message: str | None = None) -> dict[str, Any]:
    payload: dict[str, Any] = {"data": jsonable_encoder(data)}
    if message is not None:
        payload["message"] = message
    return payload
