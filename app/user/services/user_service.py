from app.user.repositories.user_repository import UserRepository
from app.user.models.user import User
from app.auth.utils.security import hash_password
from app.shared import AppException


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register_user(
        self, name: str, username: str, email: str, avatar_url: str, password: str
    ) -> User:
        if self.user_repository.get_user_by_email(email):
            raise AppException(
                status_code=400,
                code="USER_EMAIL_ALREADY_REGISTERED",
                message="Email already registered",
            )
        hashed_password = hash_password(password)
        user = User(
            id=None,
            username=username,
            name=name,
            email=email,
            avatar_url=avatar_url,
            hashed_password=hashed_password,
        )
        return self.user_repository.create_user(user)

    def get_user_by_id(self, user_id: int) -> User:
        user = self.user_repository.get_user_by_id(user_id)
        if user is None:
            raise AppException(
                status_code=404,
                code="USER_NOT_FOUND",
                message="User not found",
            )
        return user

    def get_user_by_username(self, username: str) -> User:
        user = self.user_repository.get_user_by_username(username)
        if user is None:
            raise AppException(
                status_code=404,
                code="USER_NOT_FOUND",
                message="User not found",
            )
        return user

    def get_users(self, skip: int = 0, limit: int = 100) -> list[User]:
        return self.user_repository.get_users(skip=skip, limit=limit)

    def update_me(
        self,
        user_id: int,
        name: str | None = None,
        email: str | None = None,
        avatar_url: str | None = None,
    ) -> User:
        user = self.get_user_by_id(user_id)
        if name is not None:
            user.name = name
        if email is not None:
            if self.user_repository.get_user_by_email(email):
                raise AppException(
                    status_code=400,
                    code="USER_EMAIL_ALREADY_REGISTERED",
                    message="Email already registered",
                )
            user.email = email
        if avatar_url is not None:
            user.avatar_url = avatar_url
        return self.user_repository.update_user(user)
