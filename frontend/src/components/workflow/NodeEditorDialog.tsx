/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import PromptEditor from "../AINode/PromptEditor";
import DataSourceManager from "../AINode/DataSourceManager";
import FileSelector from "../FileNode/FileSelector";
import WriteModeSelector from "../FileNode/WriteModeSelector";
import AIPromptEditor from "../FileNode/AIPromptEditor";

interface NodeEditorDialogProps {
  isOpen: boolean;
  node: any;
  edges?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const NodeEditorDialog: React.FC<NodeEditorDialogProps> = ({
  isOpen,
  node,
  edges = [],
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({});

  // 当 node 变化时，更新 formData
  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  // 分析AI节点的数据源
  const analyzeDataSources = () => {
    if (node.type !== "ai") {
      return { topInputs: [], leftInputs: [] };
    }

    const topInputs: any[] = [];
    const leftInputs: any[] = [];

    edges.forEach((edge) => {
      if (edge.target === node.id) {
        if (edge.targetHandle === "top") {
          topInputs.push({
            id: `input_${edge.source}`,
            name: `input_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "input" as const,
          });
        } else if (edge.targetHandle === "left") {
          leftInputs.push({
            id: `file_${edge.source}`,
            name: `file_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "file" as const,
          });
        }
      }
    });

    return { topInputs, leftInputs };
  };

  const { topInputs, leftInputs } = analyzeDataSources();

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
          {node.type === "input" && "编辑输入节点"}
          {node.type === "output" && "编辑输出节点"}
          {node.type === "ai" && "编辑 AI 节点"}
          {(node.type === "fileReader" || node.type === "file_reader") &&
            "编辑文件读取节点"}
          {(node.type === "fileWriter" || node.type === "file_writer") &&
            "编辑文件写入节点"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">编辑节点的详细配置</p>

        <div className="space-y-4">
          {node.type === "input" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输入名称
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
                  输入类型
                </label>
                <select
                  value={formData.type || "text"}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="text">文本</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔值</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          )}

          {node.type === "output" && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  输出名称
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
                  输出类型
                </label>
                <select
                  value={formData.type || "text"}
                  onChange={(e) => handleChange("type", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="text">文本</option>
                  <option value="number">数字</option>
                  <option value="boolean">布尔值</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          )}

          {node.type === "ai" && (
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
                  模型
                </label>
                <select
                  value={formData.model || "gemini-2.5-flash"}
                  onChange={(e) => handleChange("model", e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                </select>
              </div>
              <DataSourceManager
                topInputs={topInputs}
                leftInputs={leftInputs}
              />
              <PromptEditor
                value={formData.prompt || ""}
                onChange={(value) => handleChange("prompt", value)}
                variables={[...topInputs, ...leftInputs]}
              />
            </div>
          )}

          {(node.type === "fileReader" || node.type === "file_reader") && (
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
          )}

          {(node.type === "fileWriter" || node.type === "file_writer") && (
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
              <WriteModeSelector
                mode={(formData.mode || "direct") as "direct" | "ai"}
                onChange={(mode) => handleChange("mode", mode)}
              />
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
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.overwrite || false}
                    onChange={(e) =>
                      handleChange("overwrite", e.target.checked)
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 block text-sm text-gray-700">
                    覆盖现有文件
                  </span>
                </label>
              </div>
              {formData.mode === "ai" && (
                <AIPromptEditor
                  value={formData.aiPrompt || ""}
                  onChange={(value) => handleChange("aiPrompt", value)}
                />
              )}
            </div>
          )}
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

export default NodeEditorDialog;
