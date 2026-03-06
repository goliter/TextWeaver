import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type AINodeProps = Node<
  { label?: string; name?: string; model?: string; prompt?: string },
  "ai"
>;

const AINode: React.FC<AINodeProps> = ({ selected, data }) => {
  const nodeName = data?.label || "AI";

  return (
    <div
      className={`w-40 p-3 rounded-lg shadow-md border-2 ${
        selected ? "bg-purple-100 border-blue-500" : "bg-white border-gray-200"
      }`}
      style={{ outline: "none", boxShadow: "none" }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-purple-500" />
        <span className="font-medium text-gray-900">AI</span>
      </div>
      <div className="mt-1 text-xs text-gray-600 truncate" title={nodeName}>
        {nodeName}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default AINode;
