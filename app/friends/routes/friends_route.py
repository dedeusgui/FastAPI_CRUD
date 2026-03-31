from fastapi import APIRouter, Depends

from app.auth.dependencies.auth_dependencies import get_current_user
from app.friends.dependencies.friends_dependencies import get_friend_service
from app.friends.schemas.friends_schema import (
    FriendsListData,
    FriendsListEnvelope,
    FriendshipData,
    FriendshipEnvelope,
    FriendshipListData,
    FriendshipStatusData,
    FriendshipStatusEnvelope,
    PendingFriendshipsEnvelope,
)
from app.shared import ApiMessageResponse, build_success_response
from app.user.models.user import User

router = APIRouter(prefix="/friends", tags=["friends"])


@router.post("/request/{friend_id}", response_model=FriendshipEnvelope)
def send_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friendship = friend_service.send_friend_request(user.id, friend_id)
    return build_success_response(
        FriendshipData(friendship=friendship),
        message="Friend request sent successfully.",
    )


@router.post("/accept/{friend_id}", response_model=FriendshipEnvelope)
def accept_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friendship = friend_service.accept_friend_request(user.id, friend_id)
    return build_success_response(
        FriendshipData(friendship=friendship),
        message="Friend request accepted successfully.",
    )


@router.post("/refuse/{friend_id}", response_model=FriendshipEnvelope)
def refuse_friend_request(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friendship = friend_service.refuse_friend_request(user.id, friend_id)
    return build_success_response(
        FriendshipData(friendship=friendship),
        message="Friend request refused successfully.",
    )


@router.delete("/remove/{friend_id}", response_model=ApiMessageResponse)
def remove_friend(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friend_service.remove_friend(user.id, friend_id)
    return build_success_response(None, message="Friend removed successfully.")


@router.get("/status/{friend_id}", response_model=FriendshipStatusEnvelope)
def get_friendship_status(
    friend_id: int,
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friendship = friend_service.get_friendship_status(user.id, friend_id)
    return build_success_response(
        FriendshipStatusData(status=friendship.status.value)
    )


@router.get("/pending-requests", response_model=PendingFriendshipsEnvelope)
def get_pending_friend_requests(
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    requests = friend_service.get_pending_friend_requests(user.id)
    return build_success_response(FriendshipListData(requests=requests))


@router.get("", response_model=FriendsListEnvelope)
def get_friends(
    user: User = Depends(get_current_user),
    friend_service=Depends(get_friend_service),
):
    friends = friend_service.get_friends(user.id)
    return build_success_response(FriendsListData(friends=friends))
