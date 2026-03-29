from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:123456@localhost/fastapi"
    cookie_secure: bool = False
    session_hours: int = 1

    class Config:
        env_file = ".env"


settings = Settings()
