from pydantic import BaseModel, Field
from enum import Enum


class FriendshipStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REFUSED = "refused"


class FriendshipBase(BaseModel):
    requester_id: int = Field(
        ..., description="ID of the user sending the friend request"
    )
    receiver_id: int = Field(
        ..., description="ID of the user receiving the friend request"
    )


class FriendshipResponse(FriendshipBase):
    id: int
    status: FriendshipStatus

    class Config:
        orm_mode = True
