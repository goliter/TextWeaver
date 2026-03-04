import React from "react";
import LogDialog from "../workflow/LogDialog";

interface ExecutionStatusProps {
  executionId?: number;
  execution?: any;
  logs?: any[];
  executions?: any[];
  currentPage?: number;
  totalPages?: number;
  onCancel?: () => void;
  onSelectExecution?: (executionId: number) => void;
  onPageChange?: (page: number) => void;
}

const ExecutionStatus: React.FC<ExecutionStatusProps> = ({
  executionId,
  execution,
  logs,
  executions = [],
  currentPage = 1,
  totalPages = 1,
  onSelectExecution,
  onPageChange,
  onCancel,
}) => {
  const [logDialog, setLogDialog] = React.useState<{
    isOpen: boolean;
    log: any | null;
  }>({ isOpen: false, log: null });

  if (!execution) {
    return <div className="text-center py-12 text-gray-500">暂无执行记录</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-yellow-600 bg-yellow-100";
      case "success":
        return "text-green-600 bg-green-100";
      case "error":
        return "text-red-600 bg-red-100";
      case "pending":
        return "text-blue-600 bg-blue-100";
      case "cancelled":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">执行状态</h3>
      </div>

      {/* 执行历史记录列表 */}
      {executions.length > 0 && (
        <div>
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            历史执行记录
          </h4>
          <div className="border border-gray-200 rounded-md overflow-hidden">
            {executions.map((exec) => (
              <div
                key={exec.id}
                onClick={() => onSelectExecution?.(exec.id)}
                className={`p-2 text-xs cursor-pointer ${execution?.id === exec.id ? "bg-indigo-50 border-l-4 border-indigo-500" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">执行 #{exec.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(exec.status)}`}
                  >
                    {exec.status === "running" && "运行中"}
                    {exec.status === "success" && "成功"}
                    {exec.status === "error" && "失败"}
                    {exec.status === "pending" && "等待中"}
                    {exec.status === "cancelled" && "已取消"}
                  </span>
                </div>
                <div className="mt-1 text-gray-500">
                  {new Date(exec.start_time).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-3">
          <nav className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                className={`px-2 py-1 text-xs border rounded-md ${currentPage === page ? "bg-indigo-50 text-indigo-600" : "hover:bg-gray-50"}`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </nav>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">执行 ID</span>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-900">{executionId}</span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>状态</span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(execution.status)}`}
            >
              {execution.status === "running" && "运行中"}
              {execution.status === "success" && "成功"}
              {execution.status === "error" && "失败"}
              {execution.status === "pending" && "等待中"}
              {execution.status === "cancelled" && "已取消"}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>开始时间</span>
            <span>
              {new Date(
                execution.start_time || execution.started_at,
              ).toLocaleString()}
            </span>
          </div>
        </div>

        {(execution.end_time || execution.ended_at) && (
          <div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>结束时间</span>
              <span>
                {new Date(
                  execution.end_time || execution.ended_at,
                ).toLocaleString()}
              </span>
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
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-medium text-gray-700 mb-2 ">
                执行日志
              </h4>
              <button
                onClick={() => setLogDialog({ isOpen: true, log: logs })}
                className="text-gray-500 hover:text-indigo-600 focus:outline-none"
                title="查看日志"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>
          </div>

            <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="mb-3 pb-3 border-b border-gray-200 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">节点: {log.node_id}</span>
                    <span className="text-gray-400">
                      {new Date(log.start_time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(log.status)}`}
                    >
                      {log.status === "running" && "运行中"}
                      {log.status === "success" && "成功"}
                      {log.status === "error" && "失败"}
                      {log.status === "pending" && "等待中"}
                    </span>
                  </div>
                  {log.input_data && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-600">
                        输入:
                      </div>
                      <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                        {JSON.stringify(log.input_data, null, 2)}
                      </div>
                    </div>
                  )}
                  {log.output_data && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-gray-600">
                        输出:
                      </div>
                      <div className="text-xs text-gray-700 bg-white p-2 rounded border border-gray-200">
                        {JSON.stringify(log.output_data, null, 2)}
                      </div>
                    </div>
                  )}
                  {log.error_message && (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-red-600">
                        错误:
                      </div>
                      <div className="text-xs text-red-700 bg-red-50 p-2 rounded border border-red-200">
                        {log.error_message}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 日志详情弹窗 */}
      <LogDialog
        isOpen={logDialog.isOpen}
        log={logDialog.log}
        onClose={() => setLogDialog({ isOpen: false, log: null })}
      />
    </div>
  );
};

export default ExecutionStatus;
