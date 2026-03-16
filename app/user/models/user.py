from sqlalchemy.orm import Mapped, mapped_column
from config.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    hashed_password: Mapped[str]

    def __repr__(self):
        return f"<User(name='{self.name}', email='{self.email}')>"
