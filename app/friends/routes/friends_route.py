from fastapi import APIRouter, Depends, HTTPException
from app.friends.dependencies.friends_dependencies import get_friend_service
from app.friends.schemas.friends_schema import (
    FriendshipResponse,
    FriendshipBase,
    FriendshipStatus,
)
from app.user.schemas.user import UserResponse
from app.auth.dependencies.auth_dependencies import get_current_user
from app.user.models.user import User

router = APIRouter(prefix="/friends", tags=["friends"])


@router.post("/request", response_model=FriendshipResponse)
def send_friend_request(
    friendship: FriendshipBase,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friendship.receiver_id == user.id:
        raise HTTPException(
            status_code=400, detail="Cannot send friend request to oneself."
        )
    return friend_service.send_friend_request(user.id, friendship.receiver_id)


@router.post("/accept", response_model=FriendshipResponse)
def accept_friend_request(
    friendship: FriendshipBase,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friendship.requester_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot accept your own request.")
    return friend_service.accept_friend_request(friendship.requester_id, user.id)


@router.post("/refuse", response_model=FriendshipResponse)
def refuse_friend_request(
    friendship: FriendshipBase,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friendship.requester_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot refuse your own request.")
    return friend_service.refuse_friend_request(friendship.requester_id, user.id)


@router.delete("/remove", status_code=204)
def remove_friend(
    friendship: FriendshipBase,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friendship.requester_id != user.id and friendship.receiver_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only remove friendships you are part of.",
        )
    friend_service.remove_friend(friendship.requester_id, friendship.receiver_id)


@router.get("/status", response_model=FriendshipResponse)
def get_friendship_status(
    friendship: FriendshipBase,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    return friend_service.get_friendship_status(
        friendship.requester_id, friendship.receiver_id
    )


@router.get("/pending/{user_id}", response_model=list[FriendshipResponse])
def get_pending_friend_requests(
    user_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if user_id != user.id:
        raise HTTPException(
            status_code=403,
            detail="You can only view your own pending requests.",
        )
    return friend_service.get_pending_friend_requests(user_id)


@router.get("/{user_id}", response_model=list[UserResponse])
def get_friends(
    user_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    return friend_service.get_friends(user_id)
