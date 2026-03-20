"""Application package.

Keep imports lazy so subpackages (for example ``app.auth``) can be imported
without forcing full app startup.
"""

__all__ = ["app", "create_app"]


def __getattr__(name: str):
    if name in {"app", "create_app"}:
        from app.main import app, create_app

        return {"app": app, "create_app": create_app}[name]
    raise AttributeError(f"module 'app' has no attribute {name!r}")
