import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import type { Token, UserCreate, UserResponse } from "../types/auth";

// 创建axios实例
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api", // 后端API基础URL
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "10000"), // 请求超时时间
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authApi = {
  // 注册
  register: async (userData: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/auth/register", userData);
    return response.data;
  },

  // 登录
  login: async (username: string, password: string): Promise<Token> => {
    // 使用表单数据格式发送登录请求
    const response = await api.post<Token>(
      "/auth/login",
      new URLSearchParams({
        username,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
  },

  // 获取所有用户
  getUsers: async (
    skip: number = 0,
    limit: number = 100
  ): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>("/auth/users", {
      params: { skip, limit },
    });
    return response.data;
  },

  // 根据ID获取用户
  getUserById: async (userId: number): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/auth/users/${userId}`);
    return response.data;
  },

  // 根据邮箱获取用户
  getUserByEmail: async (email: string): Promise<UserResponse> => {
    const response = await api.get<UserResponse>(`/auth/users/email/${email}`);
    return response.data;
  },
};

export default api;
