import enum
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base
from sqlalchemy import CheckConstraint

if TYPE_CHECKING:
    from app.user.models.user import User


class Status(enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REFUSED = "refused"


class Friendship(Base):
    __tablename__ = "friendships"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    receiver_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    status: Mapped[Status] = mapped_column(
        Enum(Status), default=Status.PENDING, nullable=False
    )

    requester: Mapped["User"] = relationship(
        "User", foreign_keys=[requester_id], back_populates="sent_friendships"
    )

    receiver: Mapped["User"] = relationship(
        "User", foreign_keys=[receiver_id], back_populates="received_friendships"
    )

    __table_args__ = (
        CheckConstraint("requester_id != receiver_id", name="check_no_self_friendship"),
    )
