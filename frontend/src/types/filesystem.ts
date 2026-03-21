export const enum FileType {
  FILE = "file",
  FOLDER = "folder",
}

export interface FileBase {
  name: string;
  type: FileType;
  path: string;
  content?: string;
}

export interface FileCreate extends FileBase {
  parent_id?: number;
}

export interface FileUpdate {
  name?: string;
  content?: string;
  parent_id?: number;
}

export interface FileBaseResponse {
  id: number;
  name: string;
  type: FileType;
  path: string;
  size: number;
  flow_id: number;
  parent_id: number | null;
  created_at: string;
  updated_at: string | null;
}

export interface FileResponse extends FileBaseResponse {
  content: string | null;
}

export interface FileWithChildren extends FileBaseResponse {
  children?: FileWithChildren[];
}
