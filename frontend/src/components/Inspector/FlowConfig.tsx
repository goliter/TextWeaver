import React from "react";

interface FlowConfigProps {
  workflow: any;
  onWorkflowUpdate: (data: any) => void;
}

const FlowConfig: React.FC<FlowConfigProps> = ({ workflow, onWorkflowUpdate }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">工作流配置</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            工作流名称
          </label>
          <input
            type="text"
            value={workflow?.name || ""}
            onChange={(e) => onWorkflowUpdate({ ...workflow, name: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            描述
          </label>
          <textarea
            value={workflow?.description || ""}
            onChange={(e) => onWorkflowUpdate({ ...workflow, description: e.target.value })}
            placeholder="输入工作流描述..."
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            执行超时（秒）
          </label>
          <input
            type="number"
            value={workflow?.timeout || 300}
            onChange={(e) => onWorkflowUpdate({ ...workflow, timeout: parseInt(e.target.value) })}
            min="1"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="flex items-center text-xs font-medium text-gray-700">
            <input
              type="checkbox"
              checked={workflow?.enabled || false}
              onChange={(e) => onWorkflowUpdate({ ...workflow, enabled: e.target.checked })}
              className="mr-2"
            />
            启用工作流
          </label>
        </div>
      </div>
    </div>
  );
};

export default FlowConfig;