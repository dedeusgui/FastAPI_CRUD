from sqlalchemy.orm import Mapped, mapped_column, relationship
from config.database import Base
from typing import List
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.tasks.models.tasks import Task


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]
    tasks: Mapped[List["Task"]] = relationship("Task", back_populates="user")
    sessions = relationship("Session", back_populates="user")

    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}')>"
