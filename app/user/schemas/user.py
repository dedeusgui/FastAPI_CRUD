from pydantic import BaseModel, EmailStr, Field

from app.shared.api import ApiSuccessResponse


class UserCreate(BaseModel):
    name: str
    username: str
    email: EmailStr
    avatar_url: str
    password: str = Field(min_length=6)


class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    username: str | None = None
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserData(BaseModel):
    user: UserResponse


class UserListData(BaseModel):
    users: list[UserResponse]


UserEnvelope = ApiSuccessResponse[UserData]
UserListEnvelope = ApiSuccessResponse[UserListData]
