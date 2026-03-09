/**
 * 认证相关工具函数
 */

// 从 localStorage 获取 token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// 保存 token 到 localStorage
export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// 从 localStorage 删除 token
export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// 检查是否已登录
export const isAuthenticated = (): boolean => {
  return !!getToken();
};