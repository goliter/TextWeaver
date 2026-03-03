import React from "react";
import { Handle, Position } from "@xyflow/react";

interface InputNodeProps {
  data: any;
  isSelected: boolean;
  onDataChange: (data: any) => void;
}

const InputNode: React.FC<InputNodeProps> = ({ data, isSelected, onDataChange }) => {
  return (
    <div
      className={`w-64 p-4 rounded-lg shadow-md ${isSelected ? "bg-indigo-100 border-2 border-indigo-500" : "bg-white border border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">输入节点</h3>
        <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
      </div>
      <p className="text-sm text-gray-500 mb-3">提供工作流的输入数据</p>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            输入名称
          </label>
          <input
            type="text"
            value={data.name || ""}
            onChange={(e) => onDataChange({ ...data, name: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            输入类型
          </label>
          <select
            value={data.type || "text"}
            onChange={(e) => onDataChange({ ...data, type: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          >
            <option value="text">文本</option>
            <option value="number">数字</option>
            <option value="boolean">布尔值</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default InputNode;