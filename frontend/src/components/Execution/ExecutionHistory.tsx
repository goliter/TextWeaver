import React from "react";

interface ExecutionHistoryProps {
  executions: any[];
  onSelectExecution: (executionId: number) => void;
}

const ExecutionHistory: React.FC<ExecutionHistoryProps> = ({ executions, onSelectExecution }) => {
  if (executions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无执行历史
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-yellow-600";
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      case "pending":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="space-y-2">
      {executions.map((execution) => (
        <div
          key={execution.id}
          onClick={() => onSelectExecution(execution.id)}
          className="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="font-medium text-sm">
              执行 #{execution.id}
            </div>
            <div className={`text-xs font-medium ${getStatusColor(execution.status)}`}>
              {execution.status === "running" && "运行中"}
              {execution.status === "completed" && "已完成"}
              {execution.status === "failed" && "失败"}
              {execution.status === "pending" && "等待中"}
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>开始: {new Date(execution.started_at).toLocaleString()}</span>
            {execution.ended_at && (
              <span>结束: {new Date(execution.ended_at).toLocaleString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExecutionHistory;