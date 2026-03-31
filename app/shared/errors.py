from collections.abc import Iterable

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.shared.api import ApiErrorField, ApiErrorResponse


class AppException(Exception):
    def __init__(
        self,
        *,
        status_code: int,
        code: str,
        message: str,
        detail: str | None = None,
        fields: Iterable[ApiErrorField] | None = None,
    ):
        self.status_code = status_code
        self.code = code
        self.message = message
        self.detail = detail
        self.fields = list(fields or [])
        super().__init__(message)


def _build_error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    detail: str | None = None,
    fields: list[ApiErrorField] | None = None,
) -> JSONResponse:
    response = ApiErrorResponse(
        error={
            "code": code,
            "message": message,
            "detail": detail,
            "fields": fields or [],
        }
    )
    return JSONResponse(status_code=status_code, content=response.model_dump())


def _map_http_exception(exc: HTTPException) -> tuple[str, str]:
    detail = str(exc.detail) if exc.detail is not None else "Request failed"
    detail_map = {
        (401, "Not authenticated"): ("AUTH_NOT_AUTHENTICATED", "Not authenticated"),
        (401, "Invalid token"): ("AUTH_INVALID_TOKEN", "Invalid token"),
        (401, "Invalid email or password"): (
            "AUTH_INVALID_CREDENTIALS",
            "Invalid email or password",
        ),
    }

    if (exc.status_code, detail) in detail_map:
        return detail_map[(exc.status_code, detail)]

    status_map = {
        400: "BAD_REQUEST",
        401: "UNAUTHORIZED",
        403: "FORBIDDEN",
        404: "NOT_FOUND",
        422: "VALIDATION_ERROR",
    }
    return status_map.get(exc.status_code, "HTTP_ERROR"), detail


def _build_validation_fields(exc: RequestValidationError) -> list[ApiErrorField]:
    fields: list[ApiErrorField] = []
    for error in exc.errors():
        location = [str(part) for part in error.get("loc", [])]
        if location and location[0] in {"body", "query", "path", "header", "cookie"}:
            location = location[1:]

        field = ".".join(location) if location else "request"
        fields.append(ApiErrorField(field=field, message=error["msg"]))
    return fields


async def handle_app_exception(_: Request, exc: AppException) -> JSONResponse:
    return _build_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        detail=exc.detail,
        fields=exc.fields,
    )


async def handle_http_exception(_: Request, exc: HTTPException) -> JSONResponse:
    code, message = _map_http_exception(exc)
    return _build_error_response(
        status_code=exc.status_code,
        code=code,
        message=message,
    )


async def handle_validation_exception(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    return _build_error_response(
        status_code=422,
        code="VALIDATION_ERROR",
        message="Request validation failed",
        fields=_build_validation_fields(exc),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppException, handle_app_exception)
    app.add_exception_handler(HTTPException, handle_http_exception)
    app.add_exception_handler(RequestValidationError, handle_validation_exception)
