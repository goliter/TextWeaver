import React, { useState, useEffect } from "react";
import FileSelector from "./FileSelector";

interface FolderWriterNodeEditorProps {
  isOpen: boolean;
  node: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

const FolderWriterNodeEditor: React.FC<FolderWriterNodeEditorProps> = ({
  isOpen,
  node,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          编辑文件夹写入节点
        </h3>
        <p className="text-sm text-gray-500 mb-6">编辑节点的详细配置</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              节点名称
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择文件夹 <span className="text-red-500">*</span>
            </label>
            <FileSelector
              value={formData.folderPath || ""}
              onChange={(value) => handleChange("folderPath", value)}
              onFileSelect={(folderId, folderPath) => {
                handleChange("folderId", folderId);
                handleChange("folderPath", folderPath);
              }}
              folderOnly={true}
            />
            <p className="mt-1 text-xs text-gray-500">
              选择一个文件夹，节点会在该文件夹中创建新文件
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm font-medium text-blue-800 mb-2">
              节点说明
            </div>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• 从左侧输入端口接收数据</li>
              <li>• 在选定文件夹中创建新文件</li>
              <li>• 文件名格式：output_年月日_时分秒.txt</li>
              <li>• 如果文件已存在，会自动添加序号</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.folderPath}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default FolderWriterNodeEditor;
