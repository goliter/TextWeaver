import React from "react";

interface DataSource {
  id: string;
  name: string;
  sourceNodeId: string;
  sourceNodeName: string;
  type: "input" | "file";
  filePath?: string;
}

interface AINodeConfigProps {
  node: any;
  edges?: any[];
}

const AINodeConfig: React.FC<AINodeConfigProps> = ({ node, edges = [] }) => {
  const analyzeDataSources = () => {
    const topInputs: DataSource[] = [];
    const leftInputs: DataSource[] = [];

    edges.forEach((edge: any) => {
      if (edge.target === node.id) {
        if (edge.targetHandle === "top") {
          topInputs.push({
            id: `input_${edge.source}`,
            name: `input_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "input" as const,
          });
        } else if (edge.targetHandle === "left") {
          leftInputs.push({
            id: `file_${edge.source}`,
            name: `file_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "file" as const,
          });
        }
      }
    });

    return { topInputs, leftInputs };
  };

  const { topInputs, leftInputs } = analyzeDataSources();

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
      {renderReadOnlyField("模型", node.data?.model || "gemini-2.5-flash")}

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          提示词
        </label>
        <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[100px] whitespace-pre-wrap">
          {node.data?.prompt || "-"}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          上侧输入（一般数据）
        </h4>
        {topInputs.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            暂无上侧输入
          </div>
        ) : (
          <div className="space-y-2">
            {topInputs.map((input) => (
              <div
                key={input.id}
                className="p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
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
            暂无左侧输入
          </div>
        ) : (
          <div className="space-y-2">
            {leftInputs.map((input) => (
              <div
                key={input.id}
                className="p-3 bg-green-50 border border-green-200 rounded-md"
              >
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AINodeConfig;
