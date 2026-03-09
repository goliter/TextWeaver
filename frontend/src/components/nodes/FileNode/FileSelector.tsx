import React, { useState, useEffect } from "react";
import { filesystemApi } from "../../../api/filesystem";

interface FileSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onFileSelect: (fileId: number, filePath: string) => void;
  disabled?: boolean;
  folderOnly?: boolean;
  flowId: number;
}

const FileSelector: React.FC<FileSelectorProps> = ({
  value,
  onChange,
  onFileSelect,
  disabled = false,
  folderOnly = false,
  flowId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && flowId) {
      loadFiles();
    }
  }, [isOpen, flowId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const allFiles = await filesystemApi.getAllFiles(flowId);
      setFiles(allFiles);
    } catch (error) {
      console.error("Failed to load files:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter((file) => {
    if (folderOnly && file.type !== "folder") {
      return false;
    }
    return file.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleFileClick = (file: any) => {
    onChange(file.path);
    onFileSelect(file.id, file.path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
          placeholder={
            folderOnly
              ? "请输入文件夹路径，例如：/data"
              : "请输入文件路径，例如：/data/example.txt"
          }
        />
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {folderOnly ? "选择文件夹" : "选择文件"}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={folderOnly ? "搜索文件夹..." : "搜索文件..."}
            />
          </div>
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              加载中...
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {file.type === "folder" ? "📁" : "📄"}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500">{file.path}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredFiles.length === 0 && (
                <div className="p-4 text-center text-sm text-gray-500">
                  {folderOnly ? "未找到文件夹" : "未找到文件"}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileSelector;
