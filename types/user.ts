// types/user.ts

export interface User {
  id: string;
  fullName: string | null;
  username: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string | null;
  gender: string | null;
  birthday: string | null;
  status: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AuthDataPayload = User & {
  token: string;
  refreshToken: string;
};