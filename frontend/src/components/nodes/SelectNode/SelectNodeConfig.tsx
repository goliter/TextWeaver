import React from "react";

interface DataSource {
  id: string;
  name: string;
  sourceNodeId: string;
  sourceNodeName: string;
  type: "input" | "file";
  filePath?: string;
}

interface SelectNodeConfigProps {
  node: any;
  edges?: any[];
}

const SelectNodeConfig: React.FC<SelectNodeConfigProps> = ({
  node,
  edges = [],
}) => {
  const analyzeDataSources = () => {
    const topInputs: DataSource[] = [];
    const outputNodes: any[] = [];

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
        }
      } else if (edge.source === node.id) {
        // 下侧输出节点
        outputNodes.push({
          id: edge.target,
          name: `output_${edge.target}`, // 使用output_节点ID格式
          targetNodeId: edge.target,
          targetNodeName: `节点 ${edge.target}`,
          handle: edge.sourceHandle || "bottom",
        });
      }
    });

    return { topInputs, outputNodes };
  };

  const { topInputs, outputNodes } = analyzeDataSources();


  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          选择提示词
        </label>
        <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[100px] whitespace-pre-wrap">
          {node.data?.prompt || "-"}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          上侧输入（数据输入）
        </h4>
        {topInputs.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            暂无输入
          </div>
        ) : (
          <div className="space-y-2">
            {topInputs.slice(0, 1).map((input) => (
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
            {topInputs.length > 1 && (
              <div className="text-sm text-yellow-600 p-3 bg-yellow-50 rounded-md">
                提示：选择节点只支持一个输入，多余的输入将被忽略
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          下侧输出（选择目标）
        </h4>
        {outputNodes.length === 0 ? (
          <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
            暂无输出节点，请连接到多个输出节点
          </div>
        ) : (
          <div className="space-y-2">
            {outputNodes.map((output) => (
              <div
                key={output.id}
                className="p-3 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs font-medium bg-green-200 text-green-800 rounded">
                    输出
                  </span>
                  <span className="font-mono text-sm font-medium text-gray-900">
                    {`{${output.name}}`}
                  </span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  目标: {output.targetNodeName}
                </div>
              </div>
            ))}
            <div className="text-sm text-blue-600 p-3 bg-blue-50 rounded-md">
              AI 将根据提示词从以上输出节点中选择一个
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectNodeConfig;
