import React from "react";

interface DataSource {
  id: string;
  name: string;
  sourceNodeId: string;
  sourceNodeName: string;
  type: "input" | "file";
  filePath?: string;
}

interface DataSourceManagerProps {
  topInputs: DataSource[];
  leftInputs: DataSource[];
  onVariableRename?: (variableId: string, newName: string) => void;
}

const DataSourceManager: React.FC<DataSourceManagerProps> = ({
  topInputs,
  leftInputs,
  onVariableRename,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          上侧输入（一般数据）
        </h4>
        {topInputs.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            暂无上侧输入，请从其他节点的底部或右侧连接到此节点的顶部
          </div>
        ) : (
          <div className="space-y-2">
            {topInputs.map((input) => (
              <div
                key={input.id}
                className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-200 text-blue-800 rounded">
                      输入
                    </span>
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {`{${input.name}}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    来源: {input.sourceNodeName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          左侧输入（文件数据）
        </h4>
        {leftInputs.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            暂无左侧输入，请从文件读取节点的右侧连接到此节点的左侧
          </div>
        ) : (
          <div className="space-y-2">
            {leftInputs.map((input) => (
              <div
                key={input.id}
                className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">
                      文件
                    </span>
                    <span className="font-mono text-sm font-medium text-gray-900">
                      {`{${input.name}}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    来源: {input.sourceNodeName}
                  </div>
                  {input.filePath && (
                    <div className="text-xs text-gray-500 mt-1">
                      文件路径: {input.filePath}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(topInputs.length === 0 && leftInputs.length === 0) && (
        <div className="text-sm text-gray-500 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-yellow-600 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.746V4.746c0-2.079-1.967-3.746-2.502-3.746H4.746c-1.535 0-2.502 1.667-2.502 3.746v9.508c0 2.079 1.967 3.746 2.502 3.746zM13 14h-2v-2h2v2zm-4 0H7v-2h2v2z"
              />
            </svg>
            <div>
              <div className="font-medium text-gray-900">提示</div>
              <div className="mt-1">
                请先连接其他节点到此AI节点，然后可以在提示词编辑器中使用这些数据源。
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSourceManager;
