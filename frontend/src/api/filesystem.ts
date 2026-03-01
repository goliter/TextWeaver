import api from "./client";
import type { FileCreate, FileUpdate, FileResponse } from "../types/filesystem";

export const filesystemApi = {
  getFiles: async (parentId?: number): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>("/filesystem/files", {
      params: parentId !== undefined ? { parent_id: parentId } : undefined,
    });
    return response.data;
  },

  getAllFiles: async (): Promise<FileResponse[]> => {
    const response = await api.get<FileResponse[]>("/filesystem/files/all");
    return response.data;
  },

  getFile: async (fileId: number): Promise<FileResponse> => {
    const response = await api.get<FileResponse>(`/filesystem/files/${fileId}`);
    return response.data;
  },

  createFile: async (fileData: FileCreate): Promise<FileResponse> => {
    const response = await api.post<FileResponse>(
      "/filesystem/files",
      fileData,
    );
    return response.data;
  },

  updateFile: async (
    fileId: number,
    fileData: FileUpdate,
  ): Promise<FileResponse> => {
    const response = await api.put<FileResponse>(
      `/filesystem/files/${fileId}`,
      fileData,
    );
    return response.data;
  },

  deleteFile: async (fileId: number, recursive?: boolean): Promise<void> => {
    await api.delete(`/filesystem/files/${fileId}`, {
      params: recursive !== undefined ? { recursive } : undefined,
    });
  },
};
