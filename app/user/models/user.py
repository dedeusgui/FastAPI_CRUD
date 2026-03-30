from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.tasks.models.tasks import Task
    from app.friends.models.friendships import Friendship


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    name: Mapped[str] = mapped_column(index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    avatar_url: Mapped[str] = mapped_column(default="https://www.gravatar.com/avatar/")

    sent_friendships: Mapped[list["Friendship"]] = relationship(
        "Friendship",
        foreign_keys="Friendship.requester_id",
        back_populates="requester",
        cascade="all, delete-orphan",
    )

    received_friendships: Mapped[list["Friendship"]] = relationship(
        "Friendship",
        foreign_keys="Friendship.receiver_id",
        back_populates="receiver",
        cascade="all, delete-orphan",
    )

    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}')>"
