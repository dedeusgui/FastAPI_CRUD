from app.friends.models.friendships import Friendship, Status
from app.shared import AppException
from app.user.models.user import User
from app.friends.repositories.friends_repository import FriendRepository


class FriendService:
    def __init__(self, repository: FriendRepository):
        self.repository = repository

    def send_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if friendship:
            raise AppException(
                status_code=400,
                code="FRIEND_REQUEST_ALREADY_EXISTS",
                message="Friend request already exists.",
            )
        if user_id == friend_id:
            raise AppException(
                status_code=400,
                code="FRIEND_SELF_REQUEST_NOT_ALLOWED",
                message="Cannot send friend request to oneself.",
            )
        if not self.repository.user_exists(friend_id):
            raise AppException(
                status_code=404,
                code="USER_NOT_FOUND",
                message="Friend user not found.",
            )

        return self.repository.send_friend_request(user_id, friend_id)

    def accept_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        if user_id == friend_id:
            raise AppException(
                status_code=400,
                code="FRIEND_SELF_REQUEST_NOT_ALLOWED",
                message="Cannot accept your own request.",
            )
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise AppException(
                status_code=404,
                code="FRIEND_REQUEST_NOT_FOUND",
                message="Friend request not found.",
            )
        if friendship.status != Status.PENDING:
            raise AppException(
                status_code=400,
                code="FRIEND_REQUEST_NOT_PENDING",
                message="Friend request is not pending.",
            )
        if friendship.receiver_id != user_id or friendship.requester_id != friend_id:
            raise AppException(
                status_code=403,
                code="FORBIDDEN",
                message="Only the receiver can accept this friend request.",
            )
        return self.repository.update_friendship_status(
            user_id, friend_id, Status.ACCEPTED
        )

    def refuse_friend_request(self, user_id: int, friend_id: int) -> Friendship:
        if user_id == friend_id:
            raise AppException(
                status_code=400,
                code="FRIEND_SELF_REQUEST_NOT_ALLOWED",
                message="Cannot refuse your own request.",
            )
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise AppException(
                status_code=404,
                code="FRIEND_REQUEST_NOT_FOUND",
                message="Friend request not found.",
            )
        if friendship.status != Status.PENDING:
            raise AppException(
                status_code=400,
                code="FRIEND_REQUEST_NOT_PENDING",
                message="Friend request is not pending.",
            )
        if friendship.receiver_id != user_id or friendship.requester_id != friend_id:
            raise AppException(
                status_code=403,
                code="FORBIDDEN",
                message="Only the receiver can refuse this friend request.",
            )
        return self.repository.update_friendship_status(
            user_id, friend_id, Status.REFUSED
        )

    def get_friends(self, user_id: int) -> list[User]:
        friends = self.repository.get_friends(user_id)
        if friends is None:
            raise AppException(
                status_code=404,
                code="USER_NOT_FOUND",
                message="User not found",
            )
        return friends

    def remove_friend(self, user_id: int, friend_id: int) -> None:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise AppException(
                status_code=404,
                code="FRIENDSHIP_NOT_FOUND",
                message="Friendship not found.",
            )
        self.repository.remove_friend(user_id, friend_id)

    def get_friendship_status(self, user_id: int, friend_id: int) -> Friendship:
        friendship = self.repository.get_friendship(user_id, friend_id)
        if not friendship:
            raise AppException(
                status_code=404,
                code="FRIENDSHIP_NOT_FOUND",
                message="Friendship not found.",
            )
        return friendship

    def get_pending_friend_requests(self, user_id: int) -> list[Friendship]:
        return self.repository.get_pending_friend_requests(user_id)
