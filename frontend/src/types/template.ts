/**
 * 模板模块类型定义
 */

// ==================== 基础类型 ====================

export interface TemplateNode {
  id: number;
  template_id: number;
  node_type: string;
  name: string;
  position: { x: number; y: number };
  data: Record<string, any>;
  original_node_id?: number;
  created_at: string;
}

export interface TemplateEdge {
  id: number;
  template_id: number;
  source_node_id: number;
  target_node_id: number;
  source_handle?: string;
  target_handle?: string;
  original_edge_id?: number;
  created_at: string;
}

export interface TemplateFile {
  id: number;
  template_id: number;
  name: string;
  type: "file" | "folder";
  content?: string;
  size: number;
  parent_id?: number;
  path: string;
  original_file_id?: number;
  created_at: string;
}

// ==================== 模板主类型 ====================

export interface WorkflowTemplate {
  id: number;
  name: string;
  description?: string;
  tags?: string[];
  user_id: number;
  source_flow_id?: number;
  use_count: number;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
}

export interface WorkflowTemplateDetail extends WorkflowTemplate {
  nodes: TemplateNode[];
  edges: TemplateEdge[];
  files: TemplateFile[];
}

// ==================== 请求类型 ====================

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  tags?: string[];
  source_flow_id: number;
}

export interface UseTemplateRequest {
  name: string;
  description?: string;
}

export interface UseTemplateResponse {
  flow_id: number;
  message: string;
}

// ==================== 市场类型 ====================

export interface TemplateMarketFilter {
  keyword?: string;
  tags?: string[];
  sort_by?: "use_count" | "created_at";
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

export interface TemplateMarketList {
  templates: WorkflowTemplate[];
  total: number;
  page: number;
  page_size: number;
}
