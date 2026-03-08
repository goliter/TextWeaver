import React from "react";

interface StartNodeConfigProps {
  node: any;
}

const StartNodeConfig: React.FC<StartNodeConfigProps> = ({ node }) => {
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
      {renderReadOnlyField("节点名称", node.data?.name || "开始")}
    </div>
  );
};

export default StartNodeConfig;
