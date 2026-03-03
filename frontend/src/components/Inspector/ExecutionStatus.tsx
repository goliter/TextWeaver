import React from "react";

interface ExecutionStatusProps {
  executionId?: number;
  execution?: any;
  logs?: any[];
  onCancel?: () => void;
}

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({ executionId, execution, logs, onCancel }) => {
  if (!execution) {
    return (
      <div className="text-center py-12 text-gray-500">
        暂无执行记录
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-yellow-600 bg-yellow-100";
      case "completed":
        return "text-green-600 bg-green-100";
      case "failed":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">执行状态</h3>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>执行 ID</span>
            <span>{executionId}</span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>状态</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}>
              {execution.status === "running" && "运行中"}
              {execution.status === "completed" && "已完成"}
              {execution.status === "failed" && "失败"}
              {execution.status === "pending" && "等待中"}
            </span>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>开始时间</span>
            <span>{new Date(execution.started_at).toLocaleString()}</span>
          </div>
        </div>
        
        {execution.ended_at && (
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>结束时间</span>
              <span>{new Date(execution.ended_at).toLocaleString()}</span>
            </div>
          </div>
        )}
        
        {execution.status === "running" && onCancel && (
          <div>
            <button
              onClick={onCancel}
              className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              取消执行
            </button>
          </div>
        )}
        
        {logs && logs.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-700 mb-2">执行日志</h4>
            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-gray-700 mb-1">
                  <span className="text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="ml-2">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionStatus;