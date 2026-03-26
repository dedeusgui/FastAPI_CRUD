from app.friends.models.friendships import Friendship
from app.user.models.user import User
from sqlalchemy.orm import Session
from app.friends.repositories.friends_repository import FriendRepository
from app.friends.services.friends_service import FriendService
from fastapi import Depends, HTTPException
from config.database import get_db


def get_friend_repository(db: Session = Depends(get_db)) -> FriendRepository:
    return FriendRepository(db)


def get_friend_service(db: Session = Depends(get_friend_repository)) -> FriendService:
    return FriendService(db)
