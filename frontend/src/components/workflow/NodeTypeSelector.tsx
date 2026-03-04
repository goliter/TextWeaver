import React from "react";

export interface NodeTypeOption {
  type: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface NodeTypeSelectorProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  onCancel: () => void;
}

const nodeTypes: NodeTypeOption[] = [
  {
    type: "start",
    label: "开始节点",
    description: "工作流的起始点",
    color: "bg-indigo-100 border-indigo-300",
    icon: (
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
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    type: "ai",
    label: "AI 节点",
    description: "调用 AI 模型处理数据",
    color: "bg-purple-100 border-purple-300",
    icon: (
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
  },
  {
    type: "end",
    label: "结束节点",
    description: "工作流的结束点",
    color: "bg-green-100 border-green-300",
    icon: (
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
    ),
  },
  {
    type: "fileReader",
    label: "文件读取节点",
    description: "从文件系统读取文件内容",
    color: "bg-yellow-100 border-yellow-300",
    icon: (
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
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
  },
  {
    type: "fileWriter",
    label: "文件写入节点",
    description: "将内容写入文件系统",
    color: "bg-orange-100 border-orange-300",
    icon: (
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
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    ),
  },
];

export const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({
  isOpen,
  onSelect,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* 选择器 */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[480px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          选择节点类型
        </h3>
        <p className="text-sm text-gray-500 mb-6">选择要添加的节点类型</p>

        <div className="grid grid-cols-1 gap-3">
          {nodeTypes.map((nodeType) => (
            <button
              key={nodeType.type}
              onClick={() => onSelect(nodeType.type)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all hover:shadow-md ${nodeType.color} hover:scale-[1.02]`}
            >
              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                {nodeType.icon}
              </div>
              <div className="ml-4 text-left">
                <div className="font-medium text-gray-900">
                  {nodeType.label}
                </div>
                <div className="text-sm text-gray-600">
                  {nodeType.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};
