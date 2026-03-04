import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type EndNodeProps = Node<Node<any>, "end">;

const EndNode: React.FC<EndNodeProps> = ({ selected }) => {
  return (
    <div
      className={`w-40 p-3 rounded-lg shadow-md border-2 ${
        selected ? "bg-green-100 border-blue-500" : "bg-white border-gray-200"
      }`}
      style={{
        outline: "none",
        boxShadow: "none",
        border: selected ? "2px solid #3b82f6" : "2px solid #e5e7eb",
        borderRadius: "0.5rem",
        backgroundColor: selected ? "#dcfce7" : "#ffffff"
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="font-medium text-gray-900">结束</span>
      </div>
    </div>
  );
};

export default EndNode;
