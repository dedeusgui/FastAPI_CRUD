from datetime import datetime
from sqlalchemy.orm import Session as DBSession

from app.auth.models.session import Session


class SessionRepository:
    def __init__(self, db: DBSession):
        self.db = db

    def create_session(
        self, user_id: int, hashed_token: str, expires_at: datetime
    ) -> Session:
        new_session = Session(
            user_id=user_id,
            hash_token=hashed_token,
            expires_at=expires_at,
        )
        self.db.add(new_session)
        self.db.commit()
        self.db.refresh(new_session)
        return new_session

    def get_active_session_by_hash(
        self, hashed_token: str, current_time: datetime
    ) -> Session | None:
        return (
            self.db.query(Session)
            .filter(
                Session.hash_token == hashed_token,
                Session.revoked.is_(False),
                Session.expires_at > current_time,
            )
            .first()
        )

    def delete_session(self, session: Session) -> None:
        self.db.delete(session)
        self.db.commit()

    def revoke_session(self, session: Session) -> None:
        session.revoked = True
        self.db.commit()
