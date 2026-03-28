from pydantic import BaseModel, Field
from enum import Enum


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
