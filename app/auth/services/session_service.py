from datetime import datetime

from app.auth.models.session import Session
from app.auth.repositories.session_repository import (
    SessionRepository,
)
from app.auth.utils.security import hash_token, verify_token


class SessionService:
    def __init__(self, session_repository: SessionRepository):
        self.session_repository = session_repository

    def create_session(self, user_id: int, token: str, expires_at):
        hashed_token = hash_token(token)
        return self.session_repository.create_session(user_id, hashed_token, expires_at)

    def get_session_by_token(self, token: str) -> Session | None:
        hashed_token = hash_token(token)
        return self.session_repository.get_active_session_by_hash(
            hashed_token, datetime.now()
        )

    def delete_session(self, token: str):
        session = self.get_session_by_token(token)
        if session:
            self.session_repository.delete_session(session)

    def revoke_session(self, token: str):
        session = self.get_session_by_token(token)
        if session:
            self.session_repository.revoke_session(session)
