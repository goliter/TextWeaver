import api from "./client";
import type {
  FlowCreate,
  FlowUpdate,
  FlowResponse,
  FlowDetailResponse,
  NodeCreate,
  NodeUpdate,
  NodeResponse,
  EdgeCreate,
  EdgeResponse,
  ExecutionResponse,
  ExecutionDetailResponse,
  WorkflowExecuteRequest,
  WorkflowExecuteResponse,
} from "../types/workflow";

export const workflowApi = {
  getWorkflows: async (
    skip: number = 0,
    limit: number = 100,
  ): Promise<FlowResponse[]> => {
    const response = await api.get<FlowResponse[]>("/workflows", {
      params: { skip, limit },
    });
    return response.data;
  },

  getWorkflow: async (flowId: number): Promise<FlowDetailResponse> => {
    const response = await api.get<FlowDetailResponse>(`/workflows/${flowId}`);
    return response.data;
  },

  createWorkflow: async (flowData: FlowCreate): Promise<FlowResponse> => {
    const response = await api.post<FlowResponse>("/workflows", flowData);
    return response.data;
  },

  updateWorkflow: async (
    flowId: number,
    flowData: FlowUpdate,
  ): Promise<FlowResponse> => {
    const response = await api.put<FlowResponse>(
      `/workflows/${flowId}`,
      flowData,
    );
    return response.data;
  },

  deleteWorkflow: async (flowId: number): Promise<void> => {
    await api.delete(`/workflows/${flowId}`);
  },

  duplicateWorkflow: async (flowId: number): Promise<FlowResponse> => {
    const response = await api.post<FlowResponse>(
      `/workflows/${flowId}/duplicate`,
    );
    return response.data;
  },

  getNodes: async (flowId: number): Promise<NodeResponse[]> => {
    const response = await api.get<NodeResponse[]>(
      `/workflows/${flowId}/nodes`,
    );
    return response.data;
  },

  createNode: async (
    flowId: number,
    nodeData: NodeCreate,
  ): Promise<NodeResponse> => {
    const response = await api.post<NodeResponse>(
      `/workflows/${flowId}/nodes`,
      nodeData,
    );
    return response.data;
  },

  updateNode: async (
    flowId: number,
    nodeId: number,
    nodeData: NodeUpdate,
  ): Promise<NodeResponse> => {
    const response = await api.put<NodeResponse>(
      `/workflows/${flowId}/nodes/${nodeId}`,
      nodeData,
    );
    return response.data;
  },

  deleteNode: async (flowId: number, nodeId: number): Promise<void> => {
    await api.delete(`/workflows/${flowId}/nodes/${nodeId}`);
  },

  getEdges: async (flowId: number): Promise<EdgeResponse[]> => {
    const response = await api.get<EdgeResponse[]>(
      `/workflows/${flowId}/edges`,
    );
    return response.data;
  },

  createEdge: async (
    flowId: number,
    edgeData: EdgeCreate,
  ): Promise<EdgeResponse> => {
    const response = await api.post<EdgeResponse>(
      `/workflows/${flowId}/edges`,
      edgeData,
    );
    return response.data;
  },

  deleteEdge: async (flowId: number, edgeId: number): Promise<void> => {
    await api.delete(`/workflows/${flowId}/edges/${edgeId}`);
  },

  executeWorkflow: async (
    flowId: number,
    executeRequest?: WorkflowExecuteRequest,
  ): Promise<WorkflowExecuteResponse> => {
    const response = await api.post<WorkflowExecuteResponse>(
      `/workflows/${flowId}/execute`,
      executeRequest,
    );
    return response.data;
  },

  getExecutionHistory: async (
    flowId: number,
    skip: number = 0,
    limit: number = 100,
  ): Promise<ExecutionResponse[]> => {
    const response = await api.get<ExecutionResponse[]>(
      `/workflows/${flowId}/executions`,
      {
        params: { skip, limit },
      },
    );
    return response.data;
  },

  getExecutionCount: async (flowId: number): Promise<number> => {
    const response = await api.get<number>(
      `/workflows/${flowId}/executions/count`,
    );
    return response.data;
  },
};

export const executionApi = {
  getExecution: async (
    executionId: number,
  ): Promise<ExecutionDetailResponse> => {
    const response = await api.get<ExecutionDetailResponse>(
      `/executions/${executionId}`,
    );
    return response.data;
  },

  getExecutionLogs: async (executionId: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/executions/${executionId}/logs`);
    return response.data;
  },

  cancelExecution: async (executionId: number): Promise<ExecutionResponse> => {
    const response = await api.post<ExecutionResponse>(
      `/executions/${executionId}/cancel`,
    );
    return response.data;
  },
};
