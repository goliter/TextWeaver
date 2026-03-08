import React from "react";

interface FileReaderNodeConfigProps {
  node: any;
}

const FileReaderNodeConfig: React.FC<FileReaderNodeConfigProps> = ({
  node,
}) => {
  const renderReadOnlyField = (label: string, value: string) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
        {value || "-"}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderReadOnlyField("文件路径", node.data?.filePath || "")}
      {renderReadOnlyField("编码格式", node.data?.encoding || "utf-8")}
    </div>
  );
};

export default FileReaderNodeConfig;
