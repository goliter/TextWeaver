import { useEffect, useState, useCallback, useRef } from "react";
import type { FileResponse } from "@/types/filesystem";
import { FileType } from "@/types/filesystem";

interface FileTreeItemProps {
  file: FileResponse;
  level: number;
  expandedFolders: Set<number>;
  selectedFileId: number | null;
  onToggleFolder: (folderId: number) => void;
  onSelectFile: (file: FileResponse) => void;
  onDelete: (fileId: number) => void;
  onContextMenu: (e: React.MouseEvent, file: FileResponse) => void;
  children: FileResponse[];
  isLoading: boolean;
  loadFolderContent: (folderId: number) => Promise<FileResponse[]>;
  folderContents: { [key: number]: FileResponse[] };
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
  children,
  isLoading,
  loadFolderContent,
  folderContents,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  draggedFile,
  dragOverFolder,
}: FileTreeItemProps & {
  onDragStart: (file: FileResponse) => void;
  onDragOver: (folderId: number) => void;
  onDragLeave: () => void;
  onDrop: (folderId: number, draggedFile: FileResponse) => void;
  draggedFile: FileResponse | null;
  dragOverFolder: number | null;
}) {
  const isFolder = file.type === FileType.FOLDER;
  const isExpanded = expandedFolders.has(file.id);
  const isSelected = selectedFileId === file.id;
  const isDragOver = isFolder && dragOverFolder === file.id;

  const sortedChildren = children.sort((a, b) => {
    // 文件夹排在文件前面
    if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) {
      return -1;
    }
    if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) {
      return 1;
    }
    // 同类型按名称字母排序
    return a.name.localeCompare(b.name);
  });

  const handleClick = async () => {
    if (isFolder) {
      if (!isExpanded) {
        // 展开文件夹时加载内容
        await loadFolderContent(file.id);
      }
      onToggleFolder(file.id);
    } else {
      onSelectFile(file);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e, file);
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("text/plain", file.id.toString());
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({
        id: file.id,
        name: file.name,
        type: file.type,
        path: file.path,
      }),
    );
    onDragStart(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isFolder) return;
    if (draggedFile?.id === file.id) return;
    if (draggedFile?.parent_id === file.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(file.id);
  };

  const handleDragLeave = () => {
    onDragLeave();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isFolder || !draggedFile) return;
    onDrop(file.id, draggedFile);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        draggable={true}
        className={`flex items-center py-1 px-2 cursor-pointer select-none group ${
          isSelected
            ? "bg-indigo-600 text-white"
            : isDragOver
              ? "bg-indigo-100 text-indigo-800"
              : "hover:bg-gray-100 text-gray-800"
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
              className={`w-4 h-4 ${isExpanded ? "text-indigo-400" : "text-indigo-600"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-blue-600"
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
            onDelete(file.id);
          }}
          className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-opacity ${
            isSelected ? "hover:bg-indigo-500" : "hover:bg-gray-200"
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

      {isFolder && isExpanded && (
        <div>
          {isLoading ? (
            <div
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              className="py-2 text-xs text-gray-500"
            >
              加载中...
            </div>
          ) : sortedChildren.length > 0 ? (
            sortedChildren.map((child) => (
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
                children={
                  child.type === FileType.FOLDER
                    ? folderContents[child.id] || []
                    : []
                }
                isLoading={false}
                loadFolderContent={loadFolderContent}
                folderContents={folderContents}
                onDragStart={onDragStart}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                draggedFile={draggedFile}
                dragOverFolder={dragOverFolder}
              />
            ))
          ) : (
            <div
              style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
              className="py-2 text-xs text-gray-500"
            >
              空文件夹
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FileManagerProps {
  onFileSelect: (file: FileResponse | null) => void;
  selectedFile: FileResponse | null;
  files: FileResponse[];
  loading: boolean;
  error: string | null;
  rootFolderName?: string;
  createFile: (fileData: any) => Promise<FileResponse>;
  updateFile: (fileId: number, fileData: any) => Promise<FileResponse>;
  deleteFile: (fileId: number, recursive?: boolean) => Promise<void>;
  loadFolderContent: (folderId: number) => Promise<FileResponse[]>;
  loadFileContent: (fileId: number) => Promise<FileResponse>;
}

export function FileManager({
  onFileSelect,
  selectedFile,
  files,
  loading,
  error,
  rootFolderName,
  createFile,
  updateFile,
  deleteFile,
  loadFolderContent,
  loadFileContent,
}: FileManagerProps) {
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

  // 拖拽相关状态
  const [draggedFile, setDraggedFile] = useState<FileResponse | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<number | null>(null);
  const [showMoveConfirmModal, setShowMoveConfirmModal] = useState(false);
  const [moveSourceFile, setMoveSourceFile] = useState<FileResponse | null>(
    null,
  );
  const [moveTargetFolderId, setMoveTargetFolderId] = useState<number | null>(
    null,
  );

  // 文件夹内容状态
  const [folderContents, setFolderContents] = useState<{
    [key: number]: FileResponse[];
  }>({});
  const [loadingFolders, setLoadingFolders] = useState<Set<number>>(new Set());

  // 当files属性变化时，重置folderContents缓存
  useEffect(() => {
    // 只有当files数组长度或内容发生变化时才重置缓存
    if (files.length > 0) {
      setFolderContents({});
    }
  }, [files.length]);

  // 右键菜单状态
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileResponse;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    async (file: FileResponse) => {
      if (file.type === FileType.FILE) {
        // 点击文件时加载文件内容
        try {
          const fileWithContent = await loadFileContent(file.id);
          onFileSelect(fileWithContent);
        } catch (error) {
          console.error("Failed to load file content:", error);
          onFileSelect(file);
        }
      } else {
        onFileSelect(file);
      }
    },
    [onFileSelect, loadFileContent],
  );

  const handleLoadFolderContent = async (folderId: number) => {
    if (folderContents[folderId]) {
      // 已经加载过，直接返回
      return folderContents[folderId];
    }

    try {
      setLoadingFolders((prev) => new Set(prev).add(folderId));
      const contents = await loadFolderContent(folderId);
      setFolderContents((prev) => ({
        ...prev,
        [folderId]: contents,
      }));
      setLoadingFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      return contents;
    } catch (error) {
      console.error("Failed to load folder content:", error);
      setLoadingFolders((prev) => {
        const newSet = new Set(prev);
        newSet.delete(folderId);
        return newSet;
      });
      return [];
    }
  };

  const handleDelete = (fileId: number) => {
    openDeleteModal(fileId);
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
        parent_id: createParentId ?? undefined,
      });

      if (createType === FileType.FOLDER && newFile) {
        setExpandedFolders((prev) => new Set(prev).add(newFile.id));
      }

      // 如果有父文件夹，更新父文件夹的内容
      if (createParentId) {
        setFolderContents((prev) => {
          const updatedContents = prev[createParentId] || [];
          return {
            ...prev,
            [createParentId]: [...updatedContents, newFile],
          };
        });
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
      const updatedFile = await updateFile(renameFile.id, {
        name: renameNewName.trim(),
      });

      // 更新文件系统缓存
      const updateFileInCache: any = (files: FileResponse[]) => {
        return files.map((file) => {
          if (file.id === renameFile.id) {
            return updatedFile;
          }
          if (file.type === FileType.FOLDER && folderContents[file.id]) {
            return {
              ...file,
              children: updateFileInCache(folderContents[file.id]),
            };
          }
          return file;
        });
      };

      // 更新所有文件夹内容缓存
      Object.keys(folderContents).forEach((folderId) => {
        setFolderContents((prev) => ({
          ...prev,
          [parseInt(folderId)]: updateFileInCache(prev[parseInt(folderId)]),
        }));
      });

      setRenameNewName("");
      setRenameFile(null);
      setShowRenameModal(false);
    } catch (err: any) {
      setRenameError(err.response?.data?.detail || "重命名失败");
    }
  };

  const openDeleteModal = (fileId: number) => {
    setDeleteFileId(fileId);
    setShowDeleteModal(true);
    setContextMenu(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFileId) return;

    try {
      // 查找要删除的文件/文件夹
      const fileToDelete =
        files.find((f) => f.id === deleteFileId) ||
        Object.values(folderContents)
          .flat()
          .find((f) => f.id === deleteFileId);

      // 检查是否是文件夹
      const isFolder = fileToDelete?.type === FileType.FOLDER;

      // 调用删除API，文件夹需要递归删除
      await deleteFile(deleteFileId, isFolder);

      if (selectedFile?.id === deleteFileId) {
        onFileSelect(null);
      }

      // 从文件系统缓存中移除删除的文件/文件夹
      const removeFileFromCache = (files: FileResponse[]) => {
        return files.filter((file) => file.id !== deleteFileId);
      };

      // 更新所有文件夹内容缓存
      Object.keys(folderContents).forEach((folderId) => {
        setFolderContents((prev) => ({
          ...prev,
          [parseInt(folderId)]: removeFileFromCache(prev[parseInt(folderId)]),
        }));
      });

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

  // 拖拽相关处理函数
  const handleDragStart = (file: FileResponse) => {
    setDraggedFile(file);
    setContextMenu(null);
  };

  const handleDragOver = (folderId: number) => {
    setDragOverFolder(folderId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDrop = (folderId: number, draggedFile: FileResponse) => {
    setDragOverFolder(null);
    setMoveSourceFile(draggedFile);
    setMoveTargetFolderId(folderId);
    setShowMoveConfirmModal(true);
  };

  const handleMoveConfirm = async () => {
    if (!moveSourceFile || !moveTargetFolderId) return;

    try {
      const updatedFile = await updateFile(moveSourceFile.id, {
        parent_id: moveTargetFolderId,
      });

      // 从原文件夹中移除文件
      const removeFileFromCache = (files: FileResponse[]) => {
        return files.filter((file) => file.id !== moveSourceFile.id);
      };

      // 更新所有文件夹内容缓存
      Object.keys(folderContents).forEach((folderId) => {
        setFolderContents((prev) => ({
          ...prev,
          [parseInt(folderId)]: removeFileFromCache(prev[parseInt(folderId)]),
        }));
      });

      // 添加到新文件夹
      setFolderContents((prev) => {
        const updatedContents = prev[moveTargetFolderId] || [];
        return {
          ...prev,
          [moveTargetFolderId]: [...updatedContents, updatedFile],
        };
      });

      setShowMoveConfirmModal(false);
      setMoveSourceFile(null);
      setMoveTargetFolderId(null);
      setDraggedFile(null);
    } catch (err: any) {
      console.error("移动失败:", err);
    }
  };

  const handleMoveCancel = () => {
    setShowMoveConfirmModal(false);
    setMoveSourceFile(null);
    setMoveTargetFolderId(null);
    setDraggedFile(null);
  };

  const rootFiles = files.sort((a, b) => {
    // 文件夹排在文件前面
    if (a.type === FileType.FOLDER && b.type !== FileType.FOLDER) {
      return -1;
    }
    if (a.type !== FileType.FOLDER && b.type === FileType.FOLDER) {
      return 1;
    }
    // 同类型按名称字母排序
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="h-full flex flex-col bg-white text-gray-800 relative">
      <div className="flex items-center justify-between px-3 py-2 bg-gray-100 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          资源管理器 - {rootFolderName || "根目录"}
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
              children={
                file.type === FileType.FOLDER
                  ? folderContents[file.id] || []
                  : []
              }
              isLoading={loadingFolders.has(file.id)}
              loadFolderContent={handleLoadFolderContent}
              folderContents={folderContents}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              draggedFile={draggedFile}
              dragOverFolder={dragOverFolder}
            />
          ))
        )}
      </div>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded shadow-lg py-1 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            onClick={() => {
              openRenameModal(contextMenu.file);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center space-x-2"
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
              <div className="border-t border-gray-200 my-1" />
              <button
                onClick={() =>
                  openCreateModal(FileType.FILE, contextMenu.file.id)
                }
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center space-x-2"
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
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center space-x-2"
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
          <div className="border-t border-gray-200 my-1" />
          <button
            onClick={() => {
              handleDelete(contextMenu.file.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center space-x-2"
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

            <p className="text-gray-300 mb-6">确定要删除此项目吗？</p>

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

      {/* 移动确认弹窗 */}
      {showMoveConfirmModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-md mx-4 p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">确认移动</h3>

            <p className="text-gray-300 mb-6">
              确定要将 "{moveSourceFile?.name}" 移动到目标文件夹吗？
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={handleMoveCancel}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleMoveConfirm}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "移动中..." : "移动"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
