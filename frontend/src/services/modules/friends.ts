import { apiRequest, ApiError } from "../api/client";
import type { FriendItem, PendingFriendRequest } from "../../types/app";

interface FriendshipPayload {
  requester_id: number;
  receiver_id: number;
}

export function getFriends(userId: number) {
  return apiRequest<FriendItem[]>(`/friends/${userId}`).catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  });
}

export function getPendingFriendRequests(userId: number) {
  return apiRequest<PendingFriendRequest[]>(`/friends/pending-requests/${userId}`);
}

export function acceptFriendRequest(payload: FriendshipPayload) {
  return apiRequest<PendingFriendRequest>("/friends/accept", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function refuseFriendRequest(payload: FriendshipPayload) {
  return apiRequest<PendingFriendRequest>("/friends/refuse", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function removeFriendshipPair(payload: FriendshipPayload) {
  return apiRequest<void>("/friends/remove", {
    method: "DELETE",
    body: JSON.stringify(payload),
  });
}

export async function removeFriendship(currentUserId: number, friendId: number) {
  try {
    await removeFriendshipPair({
      requester_id: currentUserId,
      receiver_id: friendId,
    });
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 404) {
      throw error;
    }

    await removeFriendshipPair({
      requester_id: friendId,
      receiver_id: currentUserId,
    });
  }
}
