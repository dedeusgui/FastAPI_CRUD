import bcrypt
import jwt
from datetime import datetime, timedelta


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_jwt_token(user_id: int | None, secret_key: str) -> str:
    payload = {
        "sub": user_id,
        "iat": datetime.now(),
        "exp": datetime.now() + timedelta(hours=1),
    }
    token = jwt.encode(payload, secret_key, algorithm="HS256")
    return token


def decode_jwt_token(token: str, secret_key: str) -> int | None:
    try:
        payload = jwt.decode(token, secret_key, algorithms=["HS256"])
        return payload.get("sub")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
