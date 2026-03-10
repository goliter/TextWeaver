import React from "react";

interface FlowConfigProps {
  workflow: any;
  onWorkflowUpdate: (data: any) => void;
}

const FlowConfig: React.FC<FlowConfigProps> = ({
  workflow,
  //onWorkflowUpdate,
}) => {
  if (!workflow) {
    return (
      <div className="text-center py-12 text-gray-500">加载工作流信息中...</div>
    );
  }

  // 渲染只读字段
  const renderReadOnlyField = (
    label: string,
    value: string | number | boolean,
  ) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
        {value !== undefined && value !== null ? value : "-"}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">工作流配置</h3>
        <p className="text-xs text-gray-500">工作流基本信息</p>
      </div>

      <div className="space-y-3">
        {renderReadOnlyField("工作流名称", workflow?.name || "未命名")}
        <div className="space-y-1">
          <label className="block text-xs font-medium text-gray-500">
            描述
          </label>
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 whitespace-pre-wrap min-h-[60px]">
            {workflow?.description || "-"}
          </div>
        </div>

        {renderReadOnlyField(
          "创建时间",
          workflow?.created_at
            ? new Date(workflow.created_at).toLocaleString()
            : "-",
        )}
        {renderReadOnlyField(
          "更新时间",
          workflow?.updated_at
            ? new Date(workflow.updated_at).toLocaleString()
            : "-",
        )}
      </div>
    </div>
  );
};

export default FlowConfig;
