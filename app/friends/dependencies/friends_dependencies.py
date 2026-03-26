from sqlalchemy.orm import Session
from app.friends.repositories.friends_repository import FriendRepository
from app.friends.services.friends_service import FriendService
from fastapi import Depends
from config.database import get_db


def get_friend_repository(db: Session = Depends(get_db)) -> FriendRepository:
    return FriendRepository(db)


def get_friend_service(
    friend_repository: FriendRepository = Depends(get_friend_repository),
) -> FriendService:
    return FriendService(friend_repository.db)
