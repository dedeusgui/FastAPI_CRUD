import { apiRequest, ApiError } from "../api/client";
import type { FriendItem, PendingFriendRequest } from "../../types/app";

export function getFriends() {
  return apiRequest<FriendItem[]>("/friends").catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      return [];
    }

    throw error;
  });
}

export function getPendingFriendRequests() {
  return apiRequest<PendingFriendRequest[]>("/friends/pending-requests");
}

export function sendFriendRequest(friendId: number) {
  return apiRequest<PendingFriendRequest>(`/friends/request/${friendId}`, {
    method: "POST",
  });
}

export function acceptFriendRequest(friendId: number) {
  return apiRequest<PendingFriendRequest>(`/friends/accept/${friendId}`, {
    method: "POST",
  });
}

export function refuseFriendRequest(friendId: number) {
  return apiRequest<PendingFriendRequest>(`/friends/refuse/${friendId}`, {
    method: "POST",
  });
}

export function removeFriendship(friendId: number) {
  return apiRequest<void>(`/friends/remove/${friendId}`, {
    method: "DELETE",
  });
}
