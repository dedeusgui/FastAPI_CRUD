from sqlalchemy.orm import Session
from app.user.models.user import User


class UserRepository:
    def __init__(
        self,
        db: Session,
    ):
        self.db = db

    def create_user(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, id: int) -> None:
        user = self.get_user_by_id(id)
        if user:
            self.db.delete(user)
            self.db.commit()

    def update_user(self, id: int, user: User) -> None:
        db_user = self.get_user_by_id(id)
        if db_user:
            for key, value in user.__dict__.items():
                if key != "_sa_instance_state":
                    setattr(db_user, key, value)
            self.db.commit()

    def get_user_by_id(self, id: int) -> User | None:
        return self.db.query(User).filter(User.id == id).first()

    def get_user_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()
