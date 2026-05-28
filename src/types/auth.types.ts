export type UserRole = "client" | "freelancer" | "admin";

export type UserStatus = "pending" | "active" | "suspended" | "inactive";

export interface User {
  _id: string;
  email: string;
  fullName?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  avatar?: string;
  profilePicture?: string;
  firebaseUid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  phone: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface OAuthProvider {
  name: string;
  id: "google" | "github";
  icon: string;
  color: string;
}
