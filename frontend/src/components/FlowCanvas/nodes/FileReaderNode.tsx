import React from "react";
import { Handle, Position, type Node } from "@xyflow/react";

type FileReaderNodeProps = Node<
  { label?: string; name?: string; filePath?: string; encoding?: string },
  "file_reader"
>;

const FileReaderNode: React.FC<FileReaderNodeProps> = ({ selected, data }) => {
  const nodeName = data?.name || "文件读取";

  return (
    <div
      className={`w-40 p-3 rounded-lg shadow-md border-2 ${
        selected ? "bg-blue-100 border-blue-500" : "bg-white border-gray-200"
      }`}
      style={{ outline: "none", boxShadow: "none" }}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-blue-500" />
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
