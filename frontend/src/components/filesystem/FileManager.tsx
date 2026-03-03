import { useEffect, useState, useCallback, useRef } from "react";
import { useFilesystemStore } from "@/store/filesystemStore";
import type { FileResponse } from "@/types/filesystem";
import { FileType } from "@/types/filesystem";

interface FileTreeItemProps {
  file: FileResponse;
  level: number;
  expandedFolders: Set<number>;
  selectedFileId: number | null;
  onToggleFolder: (folderId: number) => void;
  onSelectFile: (file: FileResponse) => void;
  onDelete: (fileId: number, isFolder: boolean) => void;
  onContextMenu: (e: React.MouseEvent, file: FileResponse) => void;
  allFiles: FileResponse[];
}

function FileTreeItem({
  file,
  level,
  expandedFolders,
  selectedFileId,
  onToggleFolder,
  onSelectFile,
  onDelete,
  onContextMenu,
  allFiles,
}: FileTreeItemProps) {
  const isFolder = file.type === FileType.FOLDER;
  const isExpanded = expandedFolders.has(file.id);
  const isSelected = selectedFileId === file.id;

  const children = allFiles.filter((f) => f.parent_id === file.id);

  const handleClick = () => {
    if (isFolder) {
      onToggleFolder(file.id);
    } else {
      onSelectFile(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, file);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        className={`flex items-center py-1 px-2 cursor-pointer select-none group ${
          isSelected
            ? "bg-blue-600 text-white"
            : "hover:bg-gray-700 text-gray-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        <span className="w-4 h-4 mr-1 flex items-center justify-center">
          {isFolder && (
            <svg
              className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>

        <span className="mr-2">
          {isFolder ? (
            <svg
              className={`w-4 h-4 ${isExpanded ? "text-yellow-400" : "text-yellow-500"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </span>

        <span className="flex-1 truncate text-sm">{file.name}</span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(file.id, isFolder);
          }}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
            isSelected ? "hover:bg-blue-500" : "hover:bg-gray-600"
          }`}
          title="删除"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {isFolder && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeItem
              key={child.id}
              file={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedFileId={selectedFileId}
              onToggleFolder={onToggleFolder}
              onSelectFile={onSelectFile}
              onDelete={onDelete}
              onContextMenu={onContextMenu}
              allFiles={allFiles}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface FileManagerProps {
  onFileSelect: (file: FileResponse | null) => void;
  selectedFile: FileResponse | null;
}

export function FileManager({ onFileSelect, selectedFile }: FileManagerProps) {
  const {
    files,
    loading,
    error,
    loadAllFiles,
    deleteFile,
    createFile,
    updateFile,
  } = useFilesystemStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(
    new Set(),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState<FileType>(FileType.FILE);
  const [newItemName, setNewItemName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createParentId, setCreateParentId] = useState<number | null>(null);

  // 重命名相关状态
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameFile, setRenameFile] = useState<FileResponse | null>(null);
  const [renameNewName, setRenameNewName] = useState("");
  const [renameError, setRenameError] = useState<string | null>(null);

  // 删除确认相关状态
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState<number | null>(null);
  const [deleteIsFolder, setDeleteIsFolder] = useState(false);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileResponse;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAllFiles();
  }, []);

  // 点击其他地方关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggleFolder = useCallback((folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleSelectFile = useCallback(
    (file: FileResponse) => {
      onFileSelect(file);
    },
    [onFileSelect],
  );

  const handleDelete = (fileId: number, isFolder: boolean) => {
    openDeleteModal(fileId, isFolder);
  };

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, file: FileResponse) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        file,
      });
    },
    [],
  );

  const openCreateModal = (type: FileType, parentId: number | null = null) => {
    setCreateType(type);
    setCreateParentId(parentId);
    setNewItemName("");
    setCreateError(null);
    setShowCreateModal(true);
    setContextMenu(null);
  };

  const openRenameModal = (file: FileResponse) => {
    setRenameFile(file);
    setRenameNewName(file.name);
    setRenameError(null);
    setShowRenameModal(true);
    setContextMenu(null);
  };

  const handleCreate = async () => {
    if (!newItemName.trim()) {
      setCreateError("名称不能为空");
      return;
    }

    setCreateError(null);
    try {
      const newFile = await createFile({
        name: newItemName.trim(),
        type: createType,
        path: newItemName.trim(),
        parent_id: createParentId ?? undefined,
      });

      if (createType === FileType.FOLDER && newFile) {
        setExpandedFolders((prev) => new Set(prev).add(newFile.id));
      }

      setNewItemName("");
      setShowCreateModal(false);
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || "创建失败");
    }
  };

  const handleRename = async () => {
    if (!renameNewName.trim()) {
      setRenameError("名称不能为空");
      return;
    }

    if (!renameFile) {
      setRenameError("文件信息错误");
      return;
    }

    setRenameError(null);
    try {
      await updateFile(renameFile.id, {
        name: renameNewName.trim(),
      });

      setRenameNewName("");
      setRenameFile(null);
      setShowRenameModal(false);
    } catch (err: any) {
      setRenameError(err.response?.data?.detail || "重命名失败");
    }
  };

  const openDeleteModal = (fileId: number, isFolder: boolean) => {
    setDeleteFileId(fileId);
    setDeleteIsFolder(isFolder);
    setShowDeleteModal(true);
    setContextMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFileId) return;

    try {
      await deleteFile(deleteFileId, deleteIsFolder);
      if (selectedFile?.id === deleteFileId) {
        onFileSelect(null);
      }
      setShowDeleteModal(false);
      setDeleteFileId(null);
    } catch (err: any) {
      console.error("删除失败:", err);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeleteFileId(null);
  };

  const rootFiles = files.filter((f) => f.parent_id === null);

  return (
    <div className="h-full flex flex-col bg-gray-800 text-gray-300 relative">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-gray-700">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          资源管理器
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => openCreateModal(FileType.FOLDER)}
            className="p-1 hover:bg-gray-700 rounded"
            title="新建文件夹"
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
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2-2z"
              />
            </svg>
          </button>
          <button
            onClick={() => openCreateModal(FileType.FILE)}
            className="p-1 hover:bg-gray-700 rounded"
            title="新建文件"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-900 text-red-200 text-xs">{error}</div>
      )}

      <div className="flex-1 overflow-y-auto py-2">
        {loading && files.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-500">加载中...</div>
        ) : files.length === 0 ? (
          <div className="px-3 py-4 text-xs text-gray-500">
            <p>暂无文件</p>
            <p className="mt-1">点击上方按钮创建</p>
          </div>
        ) : (
          rootFiles.map((file) => (
            <FileTreeItem
              key={file.id}
              file={file}
              level={0}
              expandedFolders={expandedFolders}
              selectedFileId={selectedFile?.id ?? null}
              onToggleFolder={handleToggleFolder}
              onSelectFile={handleSelectFile}
              onDelete={handleDelete}
              onContextMenu={handleContextMenu}
              allFiles={files}
            />
          ))
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-gray-700 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              openRenameModal(contextMenu.file);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-2"
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span>重命名</span>
          </button>
          {contextMenu.file.type === FileType.FOLDER && (
            <>
              <div className="border-t border-gray-600 my-1" />
              <button
                onClick={() =>
                  openCreateModal(FileType.FILE, contextMenu.file.id)
                }
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-2"
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
                    d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>新建文件</span>
              </button>
              <button
                onClick={() =>
                  openCreateModal(FileType.FOLDER, contextMenu.file.id)
                }
                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white flex items-center space-x-2"
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
                    d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                  />
                </svg>
                <span>新建文件夹</span>
              </button>
            </>
          )}
          <div className="border-t border-gray-600 my-1" />
          <button
            onClick={() => {
              handleDelete(
                contextMenu.file.id,
                contextMenu.file.type === FileType.FOLDER,
              );
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-600 hover:text-red-300 flex items-center space-x-2"
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
            <span>删除</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">
              {createType === FileType.FOLDER ? "新建文件夹" : "新建文件"}
            </h3>

            {createError && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded text-sm">
                {createError}
              </div>
            )}

            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder={
                createType === FileType.FOLDER ? "文件夹名称" : "文件名称"
              }
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={loading || !newItemName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "创建中..." : "创建"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重命名弹窗 */}
      {showRenameModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">重命名</h3>

            {renameError && (
              <div className="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 rounded text-sm">
                {renameError}
              </div>
            )}

            <input
              type="text"
              value={renameNewName}
              onChange={(e) => setRenameNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              placeholder="新名称"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRename}
                disabled={loading || !renameNewName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "重命名中..." : "重命名"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认弹窗 */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">确认删除</h3>

            <p className="text-gray-300 mb-6">
              {deleteIsFolder
                ? "确定要删除此文件夹吗？"
                : "确定要删除此文件吗？"}
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "删除中..." : "删除"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
