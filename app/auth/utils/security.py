import bcrypt
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def verify_token(token: str, hashed_token: str) -> bool:
    token_hash = hash_token(token)
    return hmac.compare_digest(token_hash, hashed_token)


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_session_token() -> str:
    return secrets.token_urlsafe(48)


def create_session_expires_at(hours: int = 1) -> datetime:
    return datetime.now() + timedelta(hours=hours)
