import { useState } from "react";
import { FileManager } from "@/components/filesystem/FileManager";
import { FileViewer } from "@/components/filesystem/FileViewer";
import { useFilesystemStore } from "@/store/filesystemStore";
import type { FileResponse } from "@/types/filesystem";

const FilesystemTest: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileResponse | null>(null);
  const { updateFile, loading } = useFilesystemStore();

  const handleSave = async (fileId: number, content: string, name: string) => {
    await updateFile(fileId, { content, name });
  };

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-900">
      {/* 左侧文件管理器 */}
      <div className="w-64 shrink-0 border-r border-gray-700">
        <FileManager
          onFileSelect={setSelectedFile}
          selectedFile={selectedFile}
        />
      </div>

      {/* 右侧文件查看器 */}
      <div className="flex-1 min-w-0">
        <FileViewer file={selectedFile} onSave={handleSave} loading={loading} />
      </div>
    </div>
  );
};

export default FilesystemTest;
