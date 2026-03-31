from pydantic import BaseModel, Field
from enum import Enum

from app.shared.api import ApiSuccessResponse
from app.user.schemas.user import UserResponse


class FriendshipStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REFUSED = "refused"


class FriendshipBase(BaseModel):
    requester_id: int = Field(
        ..., description="ID of the user who sent the friend request"
    )
    receiver_id: int = Field(
        ..., description="ID of the user who received the friend request"
    )


class FriendshipResponse(FriendshipBase):
    id: int = Field(..., description="Unique friendship relation ID")
    status: FriendshipStatus = Field(
        ..., description="Current status of the friendship"
    )

    model_config = {"from_attributes": True}


class PendingFriendshipResponse(FriendshipResponse):
    requester: UserResponse


class FriendshipData(BaseModel):
    friendship: FriendshipResponse


class FriendshipListData(BaseModel):
    requests: list[PendingFriendshipResponse]


class FriendshipStatusData(BaseModel):
    status: FriendshipStatus


class FriendsListData(BaseModel):
    friends: list[UserResponse]


FriendshipEnvelope = ApiSuccessResponse[FriendshipData]
PendingFriendshipsEnvelope = ApiSuccessResponse[FriendshipListData]
FriendshipStatusEnvelope = ApiSuccessResponse[FriendshipStatusData]
FriendsListEnvelope = ApiSuccessResponse[FriendsListData]
