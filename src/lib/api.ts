import axiosClient from "./axios-client";
import type { AxiosRequestConfig } from "axios";

interface RequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// API helper methods
export const api = {
  get: async <T>(endpoint: string, config?: RequestConfig) => {
    try {
      const { data } = await axiosClient.get<{ data: T }>(endpoint, config);
      return data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message ||
          error.message ||
          "Request failed",
        error.response?.status || 0,
        error.response?.data,
      );
    }
  },

  post: async <T>(endpoint: string, body: unknown, config?: RequestConfig) => {
    try {
      const { data } = await axiosClient.post<{ data: T }>(
        endpoint,
        body,
        config,
      );
      return data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message ||
          error.message ||
          "Request failed",
        error.response?.status || 0,
        error.response?.data,
      );
    }
  },

  patch: async <T>(endpoint: string, body: unknown, config?: RequestConfig) => {
    try {
      const { data } = await axiosClient.patch<{ data: T }>(
        endpoint,
        body,
        config,
      );
      return data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message ||
          error.message ||
          "Request failed",
        error.response?.status || 0,
        error.response?.data,
      );
    }
  },

  put: async <T>(endpoint: string, body: unknown, config?: RequestConfig) => {
    try {
      const { data } = await axiosClient.put<{ data: T }>(
        endpoint,
        body,
        config,
      );
      return data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message ||
          error.message ||
          "Request failed",
        error.response?.status || 0,
        error.response?.data,
      );
    }
  },

  delete: async <T>(endpoint: string, config?: RequestConfig) => {
    try {
      const { data } = await axiosClient.delete<{ data: T }>(endpoint, config);
      return data.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.data?.error?.message ||
          error.message ||
          "Request failed",
        error.response?.status || 0,
        error.response?.data,
      );
    }
  },
};

export { ApiError };
