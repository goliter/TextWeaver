import React from "react";

interface FolderWriterNodeConfigProps {
  node: any;
}

const FolderWriterNodeConfig: React.FC<FolderWriterNodeConfigProps> = ({
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
      {renderReadOnlyField("文件夹路径", node.data?.folderPath || "")}
    </div>
  );
};

export default FolderWriterNodeConfig;
