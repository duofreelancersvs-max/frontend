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
  login: (data: LoginRequest, turnstileToken?: string) => 
    api.post<AuthResponse>("/auth/login", data, {
      headers: turnstileToken ? { "x-turnstile-token": turnstileToken } : {},
    }),
  
  register: (data: RegisterRequest, turnstileToken?: string) => 
    api.post<AuthResponse>("/auth/register", data, {
      headers: turnstileToken ? { "x-turnstile-token": turnstileToken } : {},
    }),
  
  getMe: () => api.get<AuthUser>("/auth/me"),
  
  logout: () => api.post<void>("/auth/logout", {}),
  
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post("/auth/change-password", { oldPassword, newPassword }),
  
  forgotPassword: (email: string, turnstileToken?: string) =>
    api.post("/auth/forgot-password", { email }, {
      headers: turnstileToken ? { "x-turnstile-token": turnstileToken } : {},
    }),
  
  resetPassword: (token: string, password: string, turnstileToken?: string) =>
    api.post("/auth/reset-password", { token, password }, {
      headers: turnstileToken ? { "x-turnstile-token": turnstileToken } : {},
    }),
  
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

export default authService;
