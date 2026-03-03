import React from "react";
import { Handle, Position } from "@xyflow/react";

interface FileReaderNodeProps {
  data: any;
  isSelected: boolean;
  onDataChange: (data: any) => void;
}

const FileReaderNode: React.FC<FileReaderNodeProps> = ({ data, isSelected, onDataChange }) => {
  return (
    <div
      className={`w-64 p-4 rounded-lg shadow-md ${isSelected ? "bg-blue-100 border-2 border-blue-500" : "bg-white border border-gray-200"}`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">文件读取</h3>
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
      </div>
      <p className="text-sm text-gray-500 mb-3">从文件系统读取文件内容</p>
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
      </div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
};

export default FileReaderNode;