/* eslint-disable @typescript-eslint/no-empty-object-type */
export enum NodeType {
  INPUT = "input",
  OUTPUT = "output",
  AI = "ai",
  FILE_READER = "file_reader",
  FILE_WRITER = "file_writer",
}

export enum ExecutionStatus {
  PENDING = "pending",
  RUNNING = "running",
  SUCCESS = "success",
  ERROR = "error",
  CANCELLED = "cancelled",
}

export interface NodePosition {
  x: number;
  y: number;
}

export interface FlowBase {
  name: string;
  description?: string;
}

export interface FlowCreate extends FlowBase {}

export interface FlowUpdate {
  name?: string;
  description?: string;
}

export interface FlowResponse extends FlowBase {
  id: number;
  user_id: number;
  created_at: string;
  updated_at?: string;
}

export interface FlowDetailResponse extends FlowResponse {
  nodes: NodeResponse[];
  edges: EdgeResponse[];
}

export interface NodeBase {
  node_type: NodeType;
  name: string;
  position: NodePosition;
  data: Record<string, any>;
}

export interface NodeCreate extends NodeBase {}

export interface NodeUpdate {
  name?: string;
  position?: NodePosition;
  data?: Record<string, any>;
}

export interface NodeResponse extends NodeBase {
  id: number;
  flow_id: number;
  created_at: string;
  updated_at?: string;
}

export interface EdgeBase {
  source_node_id: number;
  target_node_id: number;
  source_handle?: string;
  target_handle?: string;
}

export interface EdgeCreate extends EdgeBase {}

export interface EdgeResponse extends EdgeBase {
  id: number;
  flow_id: number;
  created_at: string;
}

export interface ExecutionBase {
  flow_id: number;
}

export interface ExecutionCreate extends ExecutionBase {
  inputs?: Record<string, any>;
}

export interface ExecutionResponse {
  id: number;
  flow_id: number;
  user_id: number;
  status: ExecutionStatus;
  start_time: string;
  end_time?: string;
  error_message?: string;
}

export interface ExecutionDetailResponse extends ExecutionResponse {
  logs: ExecutionLogResponse[];
}

export interface ExecutionLogBase {
  node_id: number;
  status: ExecutionStatus;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
}

export interface ExecutionLogResponse extends ExecutionLogBase {
  id: number;
  execution_id: number;
  error_message?: string;
  start_time: string;
  end_time?: string;
}

export interface WorkflowExecuteRequest {
  inputs?: Record<string, any>;
  execution_id?: number;
}

export interface WorkflowExecuteResponse {
  execution_id: number;
  status: ExecutionStatus;
  start_time: string;
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface ChatResponse {
  content: string;
  model: string;
  usage?: Record<string, number>;
}

export interface CompletionRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export interface CompletionResponse {
  text: string;
  model: string;
  usage?: Record<string, number>;
}