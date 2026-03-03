import React from "react";

interface ExecutionLogProps {
  logs: any[];
}

const ExecutionLog: React.FC<ExecutionLogProps> = ({ logs }) => {
  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无执行日志
      </div>
    );
  }

  return (
    <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
      {logs.map((log, index) => (
        <div key={index} className="text-xs text-gray-700 mb-1">
          <span className="text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span className="ml-2">{log.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ExecutionLog;