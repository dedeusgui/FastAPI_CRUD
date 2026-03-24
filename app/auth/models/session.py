from datetime import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"), index=True, nullable=False
    )
    hash_token: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    revoked: Mapped[bool] = mapped_column(default=False, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(index=True, nullable=False)

    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session(user_id={self.user_id})>"
