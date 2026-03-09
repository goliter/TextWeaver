import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type StartNodeProps = Node<{ status?: string }, "start">;

const StartNode: React.FC<StartNodeProps> = ({ selected, data }) => {
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
        return selected ? "#eef2ff" : "#ffffff";
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
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center">
        <span className="font-medium text-gray-900">开始</span>
      </div>
    </div>
  );
};

export default StartNode;
