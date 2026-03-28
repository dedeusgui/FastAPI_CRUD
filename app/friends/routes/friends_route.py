from fastapi import APIRouter, Depends, HTTPException
from app.friends.dependencies.friends_dependencies import get_friend_service
from app.friends.schemas.friends_schema import FriendshipResponse, FriendshipStatus
from app.user.schemas.user import UserResponse
from app.auth.dependencies.auth_dependencies import get_current_user
from app.user.models.user import User

router = APIRouter(prefix="/friends", tags=["friends"])


@router.post("/request/{friend_id}", response_model=FriendshipResponse)
def send_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friend_id == user.id:
        raise HTTPException(
            status_code=400, detail="Cannot send friend request to oneself."
        )
    return friend_service.send_friend_request(user.id, friend_id)


@router.post("/accept/{friend_id}", response_model=FriendshipResponse)
def accept_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friend_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot accept your own request.")
    return friend_service.accept_friend_request(user.id, friend_id)


@router.post("/refuse/{friend_id}", response_model=FriendshipResponse)
def refuse_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    if friend_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot refuse your own request.")
    return friend_service.refuse_friend_request(user.id, friend_id)


@router.delete("/remove/{friend_id}", status_code=204)
def remove_friend(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friend_service.remove_friend(user.id, friend_id)


@router.get("/status/{friend_id}", response_model=FriendshipStatus)
def get_friendship_status(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friendship = friend_service.get_friendship_status(user.id, friend_id)
    return friendship.status


@router.get("/pending-requests", response_model=list[FriendshipResponse])
def get_pending_friend_requests(
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    return friend_service.get_pending_friend_requests(user.id)


@router.get("", response_model=list[UserResponse])
def get_friends(
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    return friend_service.get_friends(user.id)
