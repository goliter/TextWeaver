import React from "react";
import { Handle, Position } from "@xyflow/react";

interface AINodeProps {
  data: any;
  isSelected: boolean;
  onDataChange: (data: any) => void;
  executionStatus?: string;
}

const AINode: React.FC<AINodeProps> = ({ data, isSelected, onDataChange, executionStatus }) => {
  return (
    <div
      className={`w-72 p-4 rounded-lg shadow-md ${isSelected ? "bg-purple-100 border-2 border-purple-500" : "bg-white border border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">AI 节点</h3>
        <div className={`w-3 h-3 rounded-full ${executionStatus === "running" ? "bg-yellow-500 animate-pulse" : executionStatus === "completed" ? "bg-green-500" : executionStatus === "failed" ? "bg-red-500" : "bg-purple-500"}`}></div>
      </div>
      <p className="text-sm text-gray-500 mb-3">使用 AI 模型处理数据</p>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            模型选择
          </label>
          <select
            value={data.model || "gpt-3.5-turbo"}
            onChange={(e) => onDataChange({ ...data, model: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
            value={data.prompt || ""}
            onChange={(e) => onDataChange({ ...data, prompt: e.target.value })}
            placeholder="输入提示词..."
            rows={3}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="input" />
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default AINode;