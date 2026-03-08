import React from "react";
import { Handle, Position } from "@xyflow/react";

interface FolderWriterNodeProps {
  data: any;
  selected: boolean;
}

const FolderWriterNode: React.FC<FolderWriterNodeProps> = ({ data, selected }) => {
  return (
    <div
      className={`w-40 p-3 rounded-lg border-2 ${selected ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white"} transition-all duration-200`}
    >
      <div className="flex flex-col items-center">
        <div className="text-2xl mb-2 text-indigo-600">📁</div>
        <div className="text-sm font-medium text-center text-gray-900">
          文件夹写入
        </div>
        <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
          {data?.name || "文件夹写入"}
        </div>
      </div>
      
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#94a3b8" }}
        id="left"
      />
    </div>
  );
};

export default FolderWriterNode;
