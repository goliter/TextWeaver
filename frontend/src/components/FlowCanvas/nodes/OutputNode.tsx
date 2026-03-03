import React from "react";
import { Handle, Position } from "@xyflow/react";

interface OutputNodeProps {
  data: any;
  isSelected: boolean;
  onDataChange: (data: any) => void;
}

const OutputNode: React.FC<OutputNodeProps> = ({ data, isSelected, onDataChange }) => {
  return (
    <div
      className={`w-64 p-4 rounded-lg shadow-md ${isSelected ? "bg-green-100 border-2 border-green-500" : "bg-white border border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">输出节点</h3>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div>
      <p className="text-sm text-gray-500 mb-3">接收工作流的输出数据</p>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            输出名称
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
            输出类型
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
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default OutputNode;