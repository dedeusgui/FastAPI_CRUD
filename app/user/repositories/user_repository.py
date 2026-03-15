import sqlite3
from app.user.models.user import User


class UserRepository:
    def __init__(self, db_path: str = "user.db"):
        self.db_path = db_path

    def create_user(self, user: User) -> User:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (name, email, hashed_password) VALUES (?, ?, ?)",
            (user.name, user.email, user.hashed_password),
        )
        conn.commit()
        user.id = cursor.lastrowid
        conn.close()
        return user

    def delete_user(self, id: int) -> None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE id = ?", (id,))
        conn.commit()
        conn.close()

    def update_user(self, id: int, user: User) -> None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            (user.name, user.email, id),
        )
        conn.commit()
        conn.close()

    def get_user_by_id(self, id: int) -> User | None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, email, hashed_password FROM users WHERE id = ?", (id,)
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return User(id=row[0], name=row[1], email=row[2], hashed_password=row[3])
        return None

    def get_user_by_email(self, email: str) -> User | None:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, name, email, hashed_password FROM users WHERE email = ?",
            (email,),
        )
        row = cursor.fetchone()
        conn.close()
        if row:
            return User(id=row[0], name=row[1], email=row[2], hashed_password=row[3])
        return None
