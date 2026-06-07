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
  /** True if the user was registered before the platform launch date (14d trial). */
  isFounder?: boolean;
  /** ISO timestamp when the trial started. */
  trialStartDate?: string;
  /** ISO timestamp when the trial ends. */
  trialEndDate?: string;
  /**
   * Derived by the server: true if the user is currently in an active
   * trial window (`trialEndDate > now`). Kept on the user object as a
   * convenience snapshot — the client can also re-derive it locally
   * from `trialEndDate`.
   */
  isInTrial?: boolean;
  /** Days of trial granted at registration. */
  trialDaysGranted?: number;
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
  turnstileToken?: string;
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
  turnstileToken?: string;
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
