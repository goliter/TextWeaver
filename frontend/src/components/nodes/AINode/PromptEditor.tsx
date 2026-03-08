import React, { useState } from "react";

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: Array<{
    id: string;
    name: string;
    sourceNodeId: string;
    sourceNodeName: string;
    type: "input" | "file";
  }>;
}

const PromptEditor: React.FC<PromptEditorProps> = ({
  value,
  onChange,
  variables,
}) => {
  const [selectedVariable, setSelectedVariable] = useState<string | null>(null);

  const handleInsertVariable = (variableName: string) => {
    const newText = value.slice(0, value.length) + `{${variableName}}`;
    onChange(newText);
  };

  const handleVariableClick = (variableName: string) => {
    setSelectedVariable(variableName);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          提示词
        </label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          placeholder="请输入提示词，可以使用 {variable_name} 来引用变量..."
        />
      </div>

      {variables.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            可用变量
          </label>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div
                key={variable.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        variable.type === "input"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {variable.type === "input" ? "输入" : "文件"}
                    </span>
                    <span className="font-mono text-sm font-medium">
                      {`{${variable.name}}`}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    来源: {variable.sourceNodeName}
                  </div>
                </div>
                <button
                  onClick={() => handleInsertVariable(variable.name)}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  插入
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {variables.length === 0 && (
        <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-md">
          暂无可用变量，请先连接其他节点到此AI节点
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
