import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type AxiosError,
} from "axios";
import type { Token, UserCreate, UserResponse } from "../types/auth";
import type { FileCreate, FileUpdate, FileResponse } from "../types/filesystem";

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
    // 从 Zustand persist 存储的 localStorage 中读取 token
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      try {
        const authData = JSON.parse(authStorage);
        const token = authData.state?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("解析 auth storage 失败:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 - 处理错误和token过期
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem("auth-storage");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// 认证相关API
export const authApi = {
  // 注册
  register: async (userData: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/auth/register", userData);
    return response.data;
  },

  // 登录
  login: async (email: string, password: string): Promise<Token> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post<Token>("/auth/login", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return response.data;
  },

  // 获取当前用户信息
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
  },
};

// 文件系统相关API
export const filesystemApi = {
  // 获取文件列表（按父文件夹）
  getFiles: async (parentId?: number): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>("/filesystem/files", {
      params: parentId !== undefined ? { parent_id: parentId } : undefined,
    });
    return response.data;
  },

  // 获取所有文件（树形结构）
  getAllFiles: async (): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>("/filesystem/files/all");
    return response.data;
  },

  // 获取单个文件
  getFile: async (fileId: number): Promise<FileResponse> => {
    const response = await api.get<FileResponse>(`/filesystem/files/${fileId}`);
    return response.data;
  },

  // 创建文件/文件夹
  createFile: async (fileData: FileCreate): Promise<FileResponse> => {
    const response = await api.post<FileResponse>(
      "/filesystem/files",
      fileData,
    );
    return response.data;
  },

  // 更新文件
  updateFile: async (
    fileId: number,
    fileData: FileUpdate,
  ): Promise<FileResponse> => {
    const response = await api.put<FileResponse>(
      `/filesystem/files/${fileId}`,
      fileData,
    );
    return response.data;
  },

  // 删除文件
  deleteFile: async (fileId: number, recursive?: boolean): Promise<void> => {
    await api.delete(`/filesystem/files/${fileId}`, {
      params: recursive !== undefined ? { recursive } : undefined,
    });
  },
};

export default api;
