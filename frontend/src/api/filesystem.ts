import api from "./client";
import type { FileCreate, FileUpdate, FileResponse } from "../types/filesystem";

export const filesystemApi = {
  getFileTree: async (flowId: number): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>(`/flows/${flowId}/files/tree`);
    return response.data;
  },

  getFiles: async (flowId: number, parentId?: number | null): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>(`/flows/${flowId}/files`, {
      params: parentId !== undefined && parentId !== null ? { parent_id: parentId } : undefined,
    });
    return response.data;
  },

  getAllFiles: async (flowId: number): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>(`/flows/${flowId}/files/all`);
    return response.data;
  },

  getFile: async (flowId: number, fileId: number): Promise<FileResponse> => {
    const response = await api.get<FileResponse>(`/flows/${flowId}/files/${fileId}`);
    return response.data;
  },

  createFile: async (flowId: number, fileData: FileCreate): Promise<FileResponse> => {
    const response = await api.post<FileResponse>(
      `/flows/${flowId}/files`,
      fileData,
    );
    return response.data;
  },

  updateFile: async (
    flowId: number,
    fileId: number,
    fileData: FileUpdate,
  ): Promise<FileResponse> => {
    const response = await api.put<FileResponse>(
      `/flows/${flowId}/files/${fileId}`,
      fileData,
    );
    return response.data;
  },

  deleteFile: async (flowId: number, fileId: number, recursive?: boolean): Promise<void> => {
    await api.delete(`/flows/${flowId}/files/${fileId}`, {
      params: recursive !== undefined ? { recursive } : undefined,
    });
  },
};
