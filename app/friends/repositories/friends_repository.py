from app.friends.models.friendships import Friendship, Status
from app.user.models.user import User
from sqlalchemy.orm import Session


class FriendRepository:
    def __init__(self, db: Session):
        self.db = db

    def send_friend_request(self, requester_id: int, receiver_id: int) -> Friendship:
        friendship = Friendship(requester_id=requester_id, receiver_id=receiver_id)
        self.db.add(friendship)
        self.db.commit()
        self.db.refresh(friendship)
        return friendship

    def get_friendship(self, requester_id: int, receiver_id: int) -> Friendship:
        return (
            self.db.query(Friendship)
            .filter_by(requester_id=requester_id, receiver_id=receiver_id)
            .first()
        )

    def update_friendship_status(
        self, requester_id: int, receiver_id: int, status: Status
    ) -> Friendship:
        friendship = self.get_friendship(requester_id, receiver_id)
        if friendship:
            friendship.status = status
            self.db.commit()
            self.db.refresh(friendship)
        return friendship

    def get_friends(self, user_id: int) -> list[User] | None:
        if not self.db.query(User).filter_by(id=user_id).first():
            return None
        friendships = (
            self.db.query(Friendship)
            .filter(
                (
                    (Friendship.requester_id == user_id)
                    | (Friendship.receiver_id == user_id)
                )
                & (Friendship.status == Status.ACCEPTED)
            )
            .all()
        )
        friends = []
        for friendship in friendships:
            if friendship.requester_id == user_id:
                friends.append(friendship.receiver)
            else:
                friends.append(friendship.requester)
        return friends

    def remove_friend(self, requester_id: int, receiver_id: int) -> None:
        friendship = self.get_friendship(requester_id, receiver_id)
        if friendship:
            self.db.delete(friendship)
            self.db.commit()

    def get_pending_friend_requests(self, user_id: int) -> list[Friendship]:
        return (
            self.db.query(Friendship)
            .filter(
                (Friendship.receiver_id == user_id)
                & (Friendship.status == Status.PENDING)
            )
            .all()
        )
