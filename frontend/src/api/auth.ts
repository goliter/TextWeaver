import api from "./client";
import type { Token, UserCreate, UserResponse } from "../types/auth";

export const authApi = {
  register: async (userData: UserCreate): Promise<UserResponse> => {
    const response = await api.post<UserResponse>("/auth/register", userData);
    return response.data;
  },

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

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>("/auth/me");
    return response.data;
  },
};
