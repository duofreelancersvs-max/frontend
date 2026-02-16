import { api } from "@/lib/api";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: "client" | "freelancer";
  fullName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export const authService = {
  login: (data: LoginRequest) => api.post<AuthResponse>("/auth/login", data),
  
  register: (data: RegisterRequest) => api.post<AuthResponse>("/auth/register", data),
  
  getMe: () => api.get<AuthUser>("/auth/me"),
  
  logout: () => api.post<void>("/auth/logout", {}),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { oldPassword, newPassword }),
  
  forgotPassword: (email: string) =>
    api.post("/auth/forgot-password", { email }),
  
  resetPassword: (token: string, password: string) =>
    api.post("/auth/reset-password", { token, password }),
  
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

export default authService;
