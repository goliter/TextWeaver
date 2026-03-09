import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type AINodeProps = Node<
  { label?: string; name?: string; model?: string; prompt?: string; status?: string },
  "ai"
>;

const AINode: React.FC<AINodeProps> = ({ selected, data }) => {
  const nodeName = data?.name || "AI";
  const status = data?.status || 'idle';
  
  // 根据状态获取颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-yellow-500';
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-purple-500';
    }
  };

  return (
    <div
      className={`w-40 p-3 rounded-lg shadow-md border-2 ${selected ? "bg-purple-100 border-blue-500" : "bg-white border-gray-200"}`}
      style={{ outline: "none", boxShadow: "none" }}
    >
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
        <span className="font-medium text-gray-900">AI</span>
      </div>
      <div className="mt-1 text-xs text-gray-600 truncate" title={nodeName}>
        {nodeName}
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

export default AINode;
