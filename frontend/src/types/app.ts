export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  detail: string | null;
  fields: FieldError[];
}

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
  requester: FriendItem;
}

export interface FriendshipItem {
  id: number;
  requester_id: number;
  receiver_id: number;
  status: FriendStatus;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends AuthPayload {
  name: string;
}

export interface UserData {
  user: AuthUser;
}

export interface UsersData {
  users: AuthUser[];
}

export interface TaskData {
  task: TaskItem;
}

export interface TasksData {
  tasks: TaskItem[];
}

export interface FriendshipData {
  friendship: FriendshipItem;
}

export interface PendingRequestsData {
  requests: PendingFriendRequest[];
}

export interface FriendsData {
  friends: FriendItem[];
}

export interface FriendshipStatusData {
  status: FriendStatus;
}
