import React from "react";
import { Handle, Position } from "@xyflow/react";

interface FileWriterNodeProps {
  data: any;
  isSelected: boolean;
  onDataChange: (data: any) => void;
}

const FileWriterNode: React.FC<FileWriterNodeProps> = ({ data, isSelected, onDataChange }) => {
  return (
    <div
      className={`w-64 p-4 rounded-lg shadow-md ${isSelected ? "bg-orange-100 border-2 border-orange-500" : "bg-white border border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">文件写入</h3>
        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
      </div>
      <p className="text-sm text-gray-500 mb-3">将数据写入文件系统</p>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            文件路径
          </label>
          <input
            type="text"
            value={data.filePath || ""}
            onChange={(e) => onDataChange({ ...data, filePath: e.target.value })}
            placeholder="输入文件路径..."
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            编码
          </label>
          <select
            value={data.encoding || "utf-8"}
            onChange={(e) => onDataChange({ ...data, encoding: e.target.value })}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
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
              checked={data.overwrite || false}
              onChange={(e) => onDataChange({ ...data, overwrite: e.target.checked })}
              className="mr-1"
            />
            覆盖现有文件
          </label>
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
};

export default FileWriterNode;