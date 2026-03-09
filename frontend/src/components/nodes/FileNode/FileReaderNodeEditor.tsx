import React, { useState, useEffect } from "react";
import FileSelector from "./FileSelector";

interface FileReaderNodeEditorProps {
  isOpen: boolean;
  node: any;
  onSave: (data: any) => void;
  onCancel: () => void;
  flowId: number;
}

const FileReaderNodeEditor: React.FC<FileReaderNodeEditorProps> = ({
  isOpen,
  node,
  onSave,
  onCancel,
  flowId,
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
          编辑文件读取节点
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
              文件路径 <span className="text-red-500">*</span>
            </label>
            <FileSelector
              value={formData.filePath || ""}
              onChange={(value) => handleChange("filePath", value)}
              onFileSelect={(fileId, filePath) => {
                handleChange("fileId", fileId);
                handleChange("filePath", filePath);
              }}
              flowId={flowId}
            />
            <p className="mt-1 text-xs text-gray-500">
              文件路径是相对于工作流根目录的路径
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              编码格式
            </label>
            <select
              value={formData.encoding || "utf-8"}
              onChange={(e) => handleChange("encoding", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utf-8">UTF-8</option>
              <option value="gbk">GBK</option>
              <option value="ascii">ASCII</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileReaderNodeEditor;
