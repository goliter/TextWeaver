/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from "react";
import type { FileResponse } from "@/types/filesystem";

interface FileViewerProps {
  file: FileResponse | null;
  onSave: (fileId: number, content: string, name: string) => Promise<void>;
  loading?: boolean;
}

export function FileViewer({ file, onSave, loading = false }: FileViewerProps) {
  const [content, setContent] = useState(file?.content || "");
  const [name, setName] = useState(file?.name || "");
  const [, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 当文件变化时更新状态
  useEffect(() => {
    if (file) {
      setContent(file.content || "");
      setName(file.name);
      setHasChanges(false);
      setSaveError(null);
      setIsEditing(false);
    }
  }, [file?.id]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setHasChanges(true);
    setIsEditing(true);
  };

  const handleSave = useCallback(async () => {
    if (!file) return;

    setSaveError(null);
    try {
      await onSave(file.id, content, name);
      setHasChanges(false);
      setIsEditing(false);
    } catch (err: any) {
      setSaveError(err.message || "保存失败");
    }
  }, [file, content, name, onSave]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (hasChanges && !loading) {
        handleSave();
      }
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-white text-gray-500">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h5a2 2 0 012 2v14a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-lg text-gray-700">选择一个文件以查看内容</p>
          <p className="text-sm mt-2 text-gray-500">
            从左侧资源管理器中选择文件
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col bg-white"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b border-gray-200">
        <div className="flex items-center space-x-3 flex-1">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="bg-transparent text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 py-1 flex-1"
            placeholder="文件名"
          />
          {hasChanges && (
            <span className="text-xs text-yellow-500">● 已修改</span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {saveError && (
            <span className="text-xs text-red-400 mr-2">{saveError}</span>
          )}
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700 disabled:bg-indigo-800 disabled:opacity-50 transition-colors flex items-center space-x-1"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>保存中...</span>
              </>
            ) : (
              <>
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
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
                <span>保存</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 py-1 bg-gray-100 border-b border-gray-200 text-xs text-gray-600 flex items-center space-x-4">
        <span>类型: {file.type}</span>
        <span>大小: {file.size} 字节</span>
        <span>
          修改时间:{" "}
          {file.updated_at
            ? new Date(file.updated_at).toLocaleString("zh-CN")
            : "未修改"}
        </span>
        <span className="ml-auto text-gray-600">快捷键: Ctrl+S 保存</span>
      </div>

      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full h-full p-4 bg-white text-gray-800 font-mono text-sm resize-none focus:outline-none border-b border-gray-200"
          placeholder="在此输入文件内容..."
          spellCheck={false}
        />
      </div>

      <div className="px-4 py-1 bg-gray-100 text-gray-600 text-xs flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <span>行数: {content.split("\n").length}</span>
          <span>字符数: {content.length}</span>
        </div>
        <div>{hasChanges ? "未保存" : "已保存"}</div>
      </div>
    </div>
  );
}
