import api from "./client";

export interface AIService {
  id: number;
  name: string;
  api_key: string;
  api_base: string;
  model: string;
  is_default: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface AIServiceCreate {
  name: string;
  api_key: string;
  api_base: string;
  model: string;
  is_default?: boolean;
}

export interface AIServiceUpdate {
  name?: string;
  api_key?: string;
  api_base?: string;
  model?: string;
  is_default?: boolean;
}

export const aiServicesApi = {
  // 获取所有AI服务配置
  getAll: async (): Promise<AIService[]> => {
    const response = await api.get("/ai-services");
    return response.data;
  },

  // 获取单个AI服务配置
  getById: async (id: number): Promise<AIService> => {
    const response = await api.get(`/ai-services/${id}`);
    return response.data;
  },

  // 创建AI服务配置
  create: async (data: AIServiceCreate): Promise<AIService> => {
    const response = await api.post("/ai-services", data);
    return response.data;
  },

  // 更新AI服务配置
  update: async (id: number, data: AIServiceUpdate): Promise<AIService> => {
    const response = await api.put(`/ai-services/${id}`, data);
    return response.data;
  },

  // 删除AI服务配置
  delete: async (id: number): Promise<void> => {
    await api.delete(`/ai-services/${id}`);
  },

  // 设置默认AI服务配置
  setDefault: async (id: number): Promise<AIService> => {
    const response = await api.put(`/ai-services/${id}/default`);
    return response.data;
  },
};
