export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface TaskItem {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: number;
}

export type FriendStatus = "accepted" | "pending" | "refused";

export interface FriendItem {
  id: number;
  name: string;
  email: string;
}

export interface PendingFriendRequest {
  id: number;
  requester_id: number;
  receiver_id: number;
  status: FriendStatus;
}

export interface FriendshipStatusResponse {
  status: FriendStatus;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}
