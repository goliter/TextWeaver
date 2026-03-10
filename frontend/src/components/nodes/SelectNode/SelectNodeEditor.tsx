import React, { useState, useEffect } from "react";
import PromptEditor from "../AINode/PromptEditor";

interface SelectNodeEditorProps {
  isOpen: boolean;
  node: any;
  edges?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const SelectNodeEditor: React.FC<SelectNodeEditorProps> = ({
  isOpen,
  node,
  edges = [],
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

  if (!isOpen || !node) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const analyzeDataSources = () => {
    const topInputs: any[] = [];
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

    // 只使用第一个输入
    return { topInputs: topInputs.slice(0, 1), outputNodes };
  };

  const { topInputs, outputNodes } = analyzeDataSources();

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          编辑选择节点
        </h3>
        <p className="text-sm text-gray-500 mb-6">编辑节点的详细配置</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              节点名称
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">
              上侧输入（数据输入）
            </h4>
            {topInputs.length === 0 ? (
              <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                暂无输入，请连接到一个输入节点
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              选择提示词
            </label>
            <PromptEditor
              value={formData.prompt || ""}
              onChange={(value) => handleChange("prompt", value)}
              variables={[...topInputs, ...outputNodes]}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectNodeEditor;
