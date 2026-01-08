import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState, UserCreate, UserResponse } from "../types/auth";
import { authApi } from "../utils/api";

// 认证状态接口扩展，添加方法
interface AuthStore extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  register: (userData: UserCreate) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  setUser: (user: UserResponse | null) => void;
  setToken: (token: string | null) => void;
}

// 初始状态
const initialState: AuthState = {
  token: null,
  user: null,
  isAuthenticated: false,
};

// 创建认证store
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 登录
      login: async (username: string, password: string) => {
        try {
          const response = await authApi.login(username, password);
          set({
            token: response.access_token,
            user: response.user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("登录失败:", error);
          throw error;
        }
      },

      // 注册
      register: async (userData: UserCreate) => {
        try {
          await authApi.register(userData);
          // 注册成功后自动登录
          await get().login(userData.username, userData.password);
        } catch (error) {
          console.error("注册失败:", error);
          throw error;
        }
      },

      // 登出
      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      // 获取当前用户信息
      getCurrentUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          set({
            user,
            isAuthenticated: true,
          });
        } catch (error) {
          console.error("获取用户信息失败:", error);
          set({
            token: null,
            user: null,
            isAuthenticated: false,
          });
        }
      },

      // 设置用户信息
      setUser: (user: UserResponse | null) => {
        set({
          user,
          isAuthenticated: !!user,
        });
      },

      // 设置token
      setToken: (token: string | null) => {
        set({
          token,
          isAuthenticated: !!token,
        });
      },
    }),
    {
      name: "auth-storage", // localStorage键名
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
