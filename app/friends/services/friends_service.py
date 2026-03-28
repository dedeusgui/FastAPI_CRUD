from fastapi import HTTPException

from app.friends.models.friendships import Friendship, Status
from app.user.models.user import User
from sqlalchemy.orm import Session
from app.friends.repositories.friends_repository import FriendRepository


class FriendService:
    def __init__(self, db: Session):
        self.repository = FriendRepository(db)

    def send_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if friendship:
            raise HTTPException(
                status_code=400, detail="Friend request already exists."
            )
        if user_id == friend_id:
            raise HTTPException(
                status_code=400, detail="Cannot send friend request to oneself."
            )
        if not self.repository.user_exists(friend_id):
            raise HTTPException(status_code=404, detail="Friend user not found.")

        return self.repository.send_friend_request(user_id, friend_id)

    def accept_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found.")
        if friendship.status != Status.PENDING:
            raise HTTPException(
                status_code=400, detail="Friend request is not pending."
            )
        if friendship.receiver_id != user_id or friendship.requester_id != friend_id:
            raise HTTPException(
                status_code=403,
                detail="Only the receiver can accept this friend request.",
            )
        return self.repository.update_friendship_status(
            user_id, friend_id, Status.ACCEPTED
        )

    def refuse_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found.")
        if friendship.status != Status.PENDING:
            raise HTTPException(
                status_code=400, detail="Friend request is not pending."
            )
        if friendship.receiver_id != user_id or friendship.requester_id != friend_id:
            raise HTTPException(
                status_code=403,
                detail="Only the receiver can refuse this friend request.",
            )
        return self.repository.update_friendship_status(
            user_id, friend_id, Status.REFUSED
        )

    def get_friends(self, user_id: int) -> list[User]:
        friends = self.repository.get_friends(user_id)
        if friends is None:
            raise HTTPException(status_code=404, detail="User not found or no friends.")
        return friends

    def remove_friend(self, user_id: int, friend_id: int) -> None:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friendship not found.")
        self.repository.remove_friend(user_id, friend_id)

    def get_friendship_status(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friendship not found.")
        return friendship

    def get_pending_friend_requests(self, user_id: int) -> list[Friendship]:
        return self.repository.get_pending_friend_requests(user_id)
