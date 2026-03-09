import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type StartNodeProps = Node<{ status?: string }, "start">;

const StartNode: React.FC<StartNodeProps> = ({ selected, data }) => {
  const status = data?.status || "idle";

  // 根据状态获取颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-yellow-500";
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      default:
        return "bg-indigo-500";
    }
  };

  return (
    <div
      className={`w-40 p-3 rounded-lg shadow-md border-2 ${selected ? "bg-indigo-100 border-blue-500" : "bg-white border-gray-200"}`}
      style={{
        outline: "none",
        boxShadow: "none",
        border: selected ? "2px solid #3b82f6" : "2px solid #e5e7eb",
        borderRadius: "0.5rem",
        backgroundColor: selected ? "#eef2ff" : "#ffffff",
      }}
    >
      <Handle type="source" position={Position.Bottom} />
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
        <span className="font-medium text-gray-900">开始</span>
      </div>
    </div>
  );
};

export default StartNode;
