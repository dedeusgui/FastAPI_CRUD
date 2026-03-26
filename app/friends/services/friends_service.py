from fastapi import HTTPException

from app.friends.models.friendships import Friendship, Status
from app.user.models.user import User
from sqlalchemy.orm import Session
from app.friends.repositories.friends_repository import FriendRepository


class FriendService:
    def __init__(self, db: Session):
        self.repository = FriendRepository(db)

    def send_friend_request(self, requester_id: int, receiver_id: int) -> Friendship:
        friendship = self.repository.get_friendship(requester_id, receiver_id)
        if friendship:
            raise HTTPException(
                status_code=400, detail="Friend request already exists."
            )
        if requester_id == receiver_id:
            raise HTTPException(
                status_code=400, detail="Cannot send friend request to oneself."
            )

        return self.repository.send_friend_request(requester_id, receiver_id)

    def accept_friend_request(self, requester_id: int, receiver_id: int) -> Friendship:
        friendship = self.repository.get_friendship(requester_id, receiver_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found.")
        if friendship.status != Status.PENDING:
            raise HTTPException(
                status_code=400, detail="Friend request is not pending."
            )
        return self.repository.update_friendship_status(
            requester_id, receiver_id, Status.ACCEPTED
        )

    def refuse_friend_request(self, requester_id: int, receiver_id: int) -> Friendship:
        friendship = self.repository.get_friendship(requester_id, receiver_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friend request not found.")
        if friendship.status != Status.PENDING:
            raise HTTPException(
                status_code=400, detail="Friend request is not pending."
            )
        return self.repository.update_friendship_status(
            requester_id, receiver_id, Status.REFUSED
        )

    def get_friends(self, user_id: int) -> list[User]:
        friends = self.repository.get_friends(user_id)
        if friends is None:
            raise HTTPException(status_code=404, detail="User not found or no friends.")
        return friends

    def remove_friend(self, requester_id: int, receiver_id: int) -> None:
        friendship = self.repository.get_friendship(requester_id, receiver_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friendship not found.")
        self.repository.remove_friend(requester_id, receiver_id)

    def get_friendship_status(self, requester_id: int, receiver_id: int) -> Friendship:
        friendship = self.repository.get_friendship(requester_id, receiver_id)
        if not friendship:
            raise HTTPException(status_code=404, detail="Friendship not found.")
        return friendship

    def get_pending_friend_requests(self, user_id: int) -> list[Friendship]:
        return self.repository.get_pending_friend_requests(user_id)
