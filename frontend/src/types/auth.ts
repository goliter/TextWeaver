// 用户创建请求类型
export interface UserCreate {
  username: string;
  email: string;
  password: string;
}

// 用户响应类型
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// 登录响应类型
export interface Token {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

// 登录请求类型（使用表单数据）
export interface LoginRequest {
  username: string;
  password: string;
}

// 认证状态
export interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isAuthenticated: boolean;
}
