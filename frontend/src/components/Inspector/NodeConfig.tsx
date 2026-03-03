import React from "react";

interface NodeConfigProps {
  node: any;
  onNodeUpdate: (data: any) => void;
}

const NodeConfig: React.FC<NodeConfigProps> = ({ node, onNodeUpdate }) => {
  if (!node) {
    return (
      <div className="text-center py-12 text-gray-500">
        选择一个节点进行配置
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    onNodeUpdate({ ...node.data, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          {node.type === "input" && "输入节点配置"}
          {node.type === "output" && "输出节点配置"}
          {node.type === "ai" && "AI 节点配置"}
          {node.type === "fileReader" && "文件读取配置"}
          {node.type === "fileWriter" && "文件写入配置"}
        </h3>
      </div>

      {node.type === "input" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              输入名称
            </label>
            <input
              type="text"
              value={node.data.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              输入类型
            </label>
            <select
              value={node.data.type || "text"}
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              输出名称
            </label>
            <input
              type="text"
              value={node.data.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              输出类型
            </label>
            <select
              value={node.data.type || "text"}
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
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              模型选择
            </label>
            <select
              value={node.data.model || "gpt-3.5-turbo"}
              onChange={(e) => handleChange("model", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Prompt
            </label>
            <textarea
              value={node.data.prompt || ""}
              onChange={(e) => handleChange("prompt", e.target.value)}
              placeholder="输入提示词..."
              rows={4}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>
      )}

      {node.type === "fileReader" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              文件路径
            </label>
            <input
              type="text"
              value={node.data.filePath || ""}
              onChange={(e) => handleChange("filePath", e.target.value)}
              placeholder="输入文件路径..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              编码
            </label>
            <select
              value={node.data.encoding || "utf-8"}
              onChange={(e) => handleChange("encoding", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utf-8">UTF-8</option>
              <option value="ascii">ASCII</option>
              <option value="base64">Base64</option>
            </select>
          </div>
        </div>
      )}

      {node.type === "fileWriter" && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              文件路径
            </label>
            <input
              type="text"
              value={node.data.filePath || ""}
              onChange={(e) => handleChange("filePath", e.target.value)}
              placeholder="输入文件路径..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              编码
            </label>
            <select
              value={node.data.encoding || "utf-8"}
              onChange={(e) => handleChange("encoding", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utf-8">UTF-8</option>
              <option value="ascii">ASCII</option>
              <option value="base64">Base64</option>
            </select>
          </div>
          <div>
            <label className="flex items-center text-xs font-medium text-gray-700">
              <input
                type="checkbox"
                checked={node.data.overwrite || false}
                onChange={(e) => handleChange("overwrite", e.target.checked)}
                className="mr-2"
              />
              覆盖现有文件
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeConfig;