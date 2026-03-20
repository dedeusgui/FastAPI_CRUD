from fastapi import HTTPException

from app.user.repositories.user_repository import UserRepository
from app.user.utils.security import create_jwt_token, decode_jwt_token, verify_password


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def authenticate_user(self, email: str, password: str) -> str:
        user = self.user_repository.get_user_by_email(email)
        if user and verify_password(password, user.hashed_password):
            return create_jwt_token(user.id, "your_secret_key")
        raise HTTPException(status_code=401, detail="Invalid email or password")

    def get_current_user(self, token: str):
        user_id = decode_jwt_token(token, "your_secret_key")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        user = self.user_repository.get_user_by_id(user_id)
        if user is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        return user
