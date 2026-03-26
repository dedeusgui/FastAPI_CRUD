from fastapi import APIRouter, Depends
from app.friends.dependencies.friends_dependencies import get_friend_service
from app.friends.schemas.friends_schema import (
    FriendshipResponse,
    FriendshipBase,
    FriendshipStatus,
)

router = APIRouter(prefix="/friends", tags=["Friends"])


@router.post("/request", response_model=FriendshipResponse)
def send_friend_request(
    friendship: FriendshipBase, friend_service=Depends(get_friend_service)
):
    return friend_service.send_friend_request(
        friendship.requester_id, friendship.receiver_id
    )


@router.post("/accept", response_model=FriendshipResponse)
def accept_friend_request(
    friendship: FriendshipBase, friend_service=Depends(get_friend_service)
):
    return friend_service.accept_friend_request(
        friendship.requester_id, friendship.receiver_id
    )


@router.post("/refuse", response_model=FriendshipResponse)
def refuse_friend_request(
    friendship: FriendshipBase, friend_service=Depends(get_friend_service)
):
    return friend_service.refuse_friend_request(
        friendship.requester_id, friendship.receiver_id
    )


@router.get("/{user_id}", response_model=list[FriendshipResponse])
def get_friends(user_id: int, friend_service=Depends(get_friend_service)):
    return friend_service.get_friends(user_id)


@router.delete("/remove", status_code=204)
def remove_friend(
    friendship: FriendshipBase, friend_service=Depends(get_friend_service)
):
    friend_service.remove_friend(friendship.requester_id, friendship.receiver_id)


@router.get("/status", response_model=FriendshipStatus)
def get_friendship_status(
    friendship: FriendshipBase, friend_service=Depends(get_friend_service)
):
    return friend_service.get_friendship_status(
        friendship.requester_id, friendship.receiver_id
    )


@router.get("/pending/{user_id}", response_model=list[FriendshipResponse])
def get_pending_friend_requests(
    user_id: int, friend_service=Depends(get_friend_service)
):
    return friend_service.get_pending_friend_requests(user_id)
