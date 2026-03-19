from app.user.repositories.user_repository import UserRepository
from app.user.utils.security import verify_password, create_jwt_token, decode_jwt_token


class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def authenticate_user(self, email: str, password: str) -> str | None:
        user = self.user_repository.get_user_by_email(email)
        if user and verify_password(password, user.hashed_password):
            token = create_jwt_token(user.id, "your_secret_key")
            return token
        return None

    def get_current_user(self, token: str):
        user_id = decode_jwt_token(token, "your_secret_key")
        if user_id:
            return self.user_repository.get_user_by_id(user_id)
