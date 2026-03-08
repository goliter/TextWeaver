/**
 * 模板模块 API 接口
 * 提供模板的创建、查询、使用等功能
 */

import api from "./client";
import type {
  WorkflowTemplate,
  WorkflowTemplateDetail,
  CreateTemplateRequest,
  UseTemplateRequest,
  UseTemplateResponse,
  TemplateShareRequest,
  TemplateShareResponse,
  SharedTemplateResponse,
  TemplateMarketList,
  TemplateMarketFilter,
} from "@/types/template";

/**
 * 创建模板
 * @param data 模板创建数据
 */
export const createTemplate = async (
  data: CreateTemplateRequest
): Promise<WorkflowTemplate> => {
  const response = await api.post("/templates", data);
  return response.data;
};

/**
 * 获取模板列表
 * @param includePublic 是否包含公开模板
 */
export const getTemplates = async (
  includePublic: boolean = true
): Promise<WorkflowTemplate[]> => {
  const response = await api.get("/templates", {
    params: { include_public: includePublic },
  });
  return response.data;
};

/**
 * 获取模板详情
 * @param templateId 模板ID
 */
export const getTemplateDetail = async (
  templateId: number
): Promise<WorkflowTemplateDetail> => {
  const response = await api.get(`/templates/${templateId}`);
  return response.data;
};

/**
 * 更新模板
 * @param templateId 模板ID
 * @param data 更新数据
 */
export const updateTemplate = async (
  templateId: number,
  data: Partial<WorkflowTemplate>
): Promise<WorkflowTemplate> => {
  const response = await api.put(`/templates/${templateId}`, data);
  return response.data;
};

/**
 * 删除模板
 * @param templateId 模板ID
 */
export const deleteTemplate = async (templateId: number): Promise<void> => {
  await api.delete(`/templates/${templateId}`);
};

/**
 * 使用模板创建工作流
 * @param templateId 模板ID
 * @param data 创建工作流数据
 */
export const usetemplate = async (
  templateId: number,
  data: UseTemplateRequest
): Promise<UseTemplateResponse> => {
  const response = await api.post(`/templates/${templateId}/use`, data);
  return response.data;
};

/**
 * 分享模板
 * @param templateId 模板ID
 * @param data 分享数据
 */
export const shareTemplate = async (
  templateId: number,
  data: TemplateShareRequest
): Promise<TemplateShareResponse> => {
  const response = await api.post(`/templates/${templateId}/share`, data);
  return response.data;
};

/**
 * 撤销模板分享
 * @param templateId 模板ID
 */
export const revokeShare = async (templateId: number): Promise<void> => {
  await api.delete(`/templates/${templateId}/share`);
};

/**
 * 通过分享链接获取模板
 * @param shareToken 分享令牌
 */
export const getSharedTemplate = async (
  shareToken: string
): Promise<SharedTemplateResponse> => {
  const response = await api.get(`/templates/shared/${shareToken}`);
  return response.data;
};

/**
 * 获取模板市场列表
 * @param filter 筛选条件
 */
export const getTemplateMarket = async (
  filter: TemplateMarketFilter = {}
): Promise<TemplateMarketList> => {
  const response = await api.get("/templates/market", {
    params: filter,
  });
  return response.data;
};
