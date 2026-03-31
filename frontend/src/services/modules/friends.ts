import { apiRequest } from "../api/client";
import type {
  FriendsData,
  FriendshipData,
  FriendshipItem,
  FriendItem,
  PendingFriendRequest,
  PendingRequestsData,
} from "../../types/app";

export function getFriends() {
  return apiRequest<FriendsData>("/friends").then(({ friends }) => friends);
}

export function getPendingFriendRequests() {
  return apiRequest<PendingRequestsData>("/friends/pending-requests").then(
    ({ requests }) => requests,
  );
}

export function sendFriendRequest(friendId: number) {
  return apiRequest<FriendshipData>(`/friends/request/${friendId}`, {
    method: "POST",
  }).then(({ friendship }) => friendship);
}

export function acceptFriendRequest(friendId: number) {
  return apiRequest<FriendshipData>(`/friends/accept/${friendId}`, {
    method: "POST",
  }).then(({ friendship }) => friendship);
}

export function refuseFriendRequest(friendId: number) {
  return apiRequest<FriendshipData>(`/friends/refuse/${friendId}`, {
    method: "POST",
  }).then(({ friendship }) => friendship);
}

export function removeFriendship(friendId: number) {
  return apiRequest<null>(`/friends/remove/${friendId}`, {
    method: "DELETE",
  }).then(() => undefined);
}
