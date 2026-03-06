import React, { useState } from "react";

interface File {
  id: number;
  name: string;
  type: string;
  size: number;
  parent_id: number | null;
  children?: File[];
}

interface FileSystemTreeProps {
  files: File[];
  onFileSelect: (fileId: number) => void;
  onFileCreate: (fileData: any) => void;
  onFileDelete: (fileId: number) => void;
  selectedFileId: number | null;
}

const FileSystemTree: React.FC<FileSystemTreeProps> = ({
  files,
  onFileSelect,
  onFileCreate,
  onFileDelete,
  selectedFileId,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [showCreateDialog, setShowCreateDialog] = useState<boolean>(false);
  const [createType, setCreateType] = useState<"file" | "folder">('file');
  const [newName, setNewName] = useState<string>("");
  const [parentId, setParentId] = useState<number | null>(null);

  const handleToggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFile = () => {
    if (newName.trim()) {
      onFileCreate({
        name: newName.trim(),
        type: createType,
        parent_id: parentId,
        content: createType === "file" ? "" : undefined,
      });
      setShowCreateDialog(false);
      setNewName("");
      setParentId(null);
    }
  };

  const handleShowCreateDialog = (type: "file" | "folder", folderId: number | null) => {
    setCreateType(type);
    setParentId(folderId);
    setShowCreateDialog(true);
  };

  const renderFileTree = (files: File[], parentId: number | null) => {
    const filteredFiles = files.filter((file) => file.parent_id === parentId);
    
    return (
      <ul className="space-y-1 px-2 py-1">
        {filteredFiles.map((file) => (
          <li key={file.id}>
            <div
              className={`flex items-center py-1 px-2 rounded-md cursor-pointer ${selectedFileId === file.id ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}`}
              onClick={() => onFileSelect(file.id)}
            >
              {file.type === "folder" ? (
                <>
                  <button
                    className="mr-2 text-gray-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleFolder(file.id);
                    }}
                  >
                    {expandedFolders.has(file.id) ? '▼' : '►'}
                  </button>
                  <svg
                    className="w-4 h-4 mr-2 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </>
              ) : (
                <svg
                  className="w-4 h-4 mr-2 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              )}
              <span className="flex-1">{file.name}</span>
              {file.type === "file" && (
                <span className="text-xs text-gray-500">{file.size} B</span>
              )}
              <div className="ml-2 flex space-x-1">
                <button
                  className="text-gray-500 hover:text-indigo-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowCreateDialog('file', file.type === 'folder' ? file.id : file.parent_id);
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
                {file.type === "folder" && (
                  <button
                    className="text-gray-500 hover:text-indigo-600 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowCreateDialog('folder', file.id);
                    }}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    />
                  </button>
                )}
                <button
                  className="text-gray-500 hover:text-red-600 p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`确定要删除 ${file.name} 吗？`)) {
                      onFileDelete(file.id);
                    }
                  }}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {file.type === "folder" && expandedFolders.has(file.id) && file.children && (
              <div className="pl-6">
                {renderFileTree(file.children, file.id)}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      {/* 根目录操作 */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => handleShowCreateDialog('file', null)}
            className="text-sm px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            新建文件
          </button>
          <button
            onClick={() => handleShowCreateDialog('folder', null)}
            className="text-sm px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            新建文件夹
          </button>
        </div>
      </div>
      
      {/* 文件树 */}
      <div className="py-2">
        {renderFileTree(files, null)}
      </div>
      
      {/* 创建文件/文件夹弹窗 */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 w-80">
            <h3 className="font-medium text-gray-700 mb-3">
              {createType === "file" ? "新建文件" : "新建文件夹"}
            </h3>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={createType === "file" ? "文件名" : "文件夹名"}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex space-x-2 justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateFile}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileSystemTree;