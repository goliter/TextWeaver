import { create } from "zustand";
import type { FileResponse, FileCreate, FileUpdate } from "../types/filesystem";
import { filesystemApi } from "../utils/api";

interface FilesystemState {
  files: FileResponse[];
  currentFolderId: number | null;
  selectedFile: FileResponse | null;
  loading: boolean;
  error: string | null;
}

interface FilesystemActions {
  loadFiles: (parentId?: number) => Promise<void>;
  loadAllFiles: () => Promise<void>;
  createFile: (fileData: FileCreate) => Promise<FileResponse>;
  updateFile: (fileId: number, fileData: FileUpdate) => Promise<void>;
  deleteFile: (fileId: number, recursive?: boolean) => Promise<void>;
  selectFile: (file: FileResponse | null) => void;
  setCurrentFolder: (folderId: number | null) => void;
  setError: (error: string | null) => void;
}

type FilesystemStore = FilesystemState & FilesystemActions;

const initialState: FilesystemState = {
  files: [],
  currentFolderId: null,
  selectedFile: null,
  loading: false,
  error: null,
};

export const useFilesystemStore = create<FilesystemStore>()((set) => ({
  ...initialState,

  loadFiles: async (parentId?: number) => {
    set({ loading: true, error: null });
    try {
      const files = await filesystemApi.getFiles(parentId);
      set({
        files,
        currentFolderId: parentId ?? null,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "加载文件失败",
        loading: false,
      });
    }
  },

  loadAllFiles: async () => {
    set({ loading: true, error: null });
    try {
      const files = await filesystemApi.getAllFiles();
      set({
        files,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "加载文件失败",
        loading: false,
      });
    }
  },

  createFile: async (fileData: FileCreate) => {
    set({ loading: true, error: null });
    try {
      const newFile = await filesystemApi.createFile(fileData);
      set((state) => ({
        files: [...state.files, newFile],
        loading: false,
      }));
      return newFile;
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "创建文件失败",
        loading: false,
      });
      throw error;
    }
  },

  updateFile: async (fileId: number, fileData: FileUpdate) => {
    set({ loading: true, error: null });
    try {
      const updatedFile = await filesystemApi.updateFile(fileId, fileData);
      set((state) => ({
        files: state.files.map((file) =>
          file.id === fileId ? updatedFile : file,
        ),
        selectedFile:
          state.selectedFile?.id === fileId ? updatedFile : state.selectedFile,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "更新文件失败",
        loading: false,
      });
    }
  },

  deleteFile: async (fileId: number, recursive: boolean = false) => {
    set({ loading: true, error: null });
    try {
      await filesystemApi.deleteFile(fileId, recursive);
      set((state) => ({
        files: state.files.filter((file) => file.id !== fileId),
        selectedFile:
          state.selectedFile?.id === fileId ? null : state.selectedFile,
        loading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "删除文件失败",
        loading: false,
      });
    }
  },

  selectFile: (file: FileResponse | null) => {
    set({ selectedFile: file });
  },

  setCurrentFolder: (folderId: number | null) => {
    set({ currentFolderId: folderId });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
