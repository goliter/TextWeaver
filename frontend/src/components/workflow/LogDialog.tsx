import React from "react";

interface LogDialogProps {
  isOpen: boolean;
  log: any;
  onClose: () => void;
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
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const renderLogItem = (logItem: any) => (
  <div
    key={logItem.id}
    className="border-b border-gray-200 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0"
  >
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="text-sm font-medium text-gray-600">节点 ID</div>
        <div className="text-sm text-gray-900">{logItem.node_id}</div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-600">状态</div>
        <div className="text-sm">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(logItem.status)}`}
          >
            {logItem.status === "running" && "运行中"}
            {logItem.status === "success" && "成功"}
            {logItem.status === "error" && "失败"}
            {logItem.status === "pending" && "等待中"}
          </span>
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-gray-600">开始时间</div>
        <div className="text-sm text-gray-900">
          {logItem.start_time
            ? new Date(logItem.start_time).toLocaleString()
            : "-"}
        </div>
      </div>
      {logItem.end_time && (
        <div>
          <div className="text-sm font-medium text-gray-600">结束时间</div>
          <div className="text-sm text-gray-900">
            {new Date(logItem.end_time).toLocaleString()}
          </div>
        </div>
      )}
    </div>

    {logItem.input_data && (
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-600 mb-2">输入数据</div>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(logItem.input_data, null, 2)}
          </pre>
        </div>
      </div>
    )}

    {logItem.output_data && (
      <div className="mt-4">
        <div className="text-sm font-medium text-gray-600 mb-2">输出数据</div>
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap">
            {JSON.stringify(logItem.output_data, null, 2)}
          </pre>
        </div>
      </div>
    )}

    {logItem.error_message && (
      <div className="mt-4">
        <div className="text-sm font-medium text-red-600 mb-2">错误信息</div>
        <div className="bg-red-50 p-4 rounded-md border border-red-200">
          <pre className="text-sm text-red-800 whitespace-pre-wrap">
            {logItem.error_message}
          </pre>
        </div>
      </div>
    )}
  </div>
);

const LogDialog: React.FC<LogDialogProps> = ({ isOpen, log, onClose }) => {
  if (!isOpen || !log) return null;

  const isArray = Array.isArray(log);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isArray ? "执行日志详情" : "节点日志详情"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-4">
          {isArray
            ? log.map((logItem: any) => renderLogItem(logItem))
            : renderLogItem(log)}
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogDialog;
