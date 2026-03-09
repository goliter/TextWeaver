import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type FileReaderNodeProps = Node<
  {
    label?: string;
    name?: string;
    filePath?: string;
    encoding?: string;
    status?: string;
  },
  "file_reader"
>;

const FileReaderNode: React.FC<FileReaderNodeProps> = ({ selected, data }) => {
  const nodeName = data?.name || "文件读取";
  const status = data?.status || "idle";


  // 根据状态获取背景颜色
  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case "running":
        return "#fffbeb";
      case "success":
        return "#ecfdf5";
      case "error":
        return "#fef2f2";
      default:
        return selected ? "#dbeafe" : "#ffffff";
    }
  };

  // 根据状态获取边框颜色
  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case "running":
        return "#f59e0b";
      case "success":
        return "#10b981";
      case "error":
        return "#ef4444";
      default:
        return selected ? "#3b82f6" : "#e5e7eb";
    }
  };

  return (
    <div
      className="w-40 p-3 rounded-lg shadow-md border-2"
      style={{
        outline: "none",
        boxShadow: "none",
        border: `2px solid ${getStatusBorderColor(status)}`,
        borderRadius: "0.5rem",
        backgroundColor: getStatusBackgroundColor(status),
        transition: "all 0.3s ease",
      }}
    >
      <div className="flex items-center">
        <span className="font-medium text-gray-900">文件读取</span>
      </div>
      <div className="mt-1 text-xs text-gray-600 truncate" title={nodeName}>
        {nodeName}
      </div>
      {data?.filePath && (
        <div
          className="mt-1 text-xs text-gray-500 truncate"
          title={data.filePath}
        >
          {data.filePath}
        </div>
      )}
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

export default FileReaderNode;
