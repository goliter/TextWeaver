import React from "react";

interface WriteModeSelectorProps {
  mode: "direct" | "ai";
  onChange: (mode: "direct" | "ai") => void;
}

const WriteModeSelector: React.FC<WriteModeSelectorProps> = ({
  mode,
  onChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        写入模式
      </label>
      <div className="flex space-x-4">
        <div className="flex items-center">
          <input
            type="radio"
            id="mode-direct"
            name="write-mode"
            value="direct"
            checked={mode === "direct"}
            onChange={() => onChange("direct")}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label htmlFor="mode-direct" className="ml-2 block text-sm text-gray-700">
            直接写入
          </label>
        </div>
        <div className="flex items-center">
          <input
            type="radio"
            id="mode-ai"
            name="write-mode"
            value="ai"
            checked={mode === "ai"}
            onChange={() => onChange("ai")}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label htmlFor="mode-ai" className="ml-2 block text-sm text-gray-700">
            AI修改
          </label>
        </div>
      </div>
      <div className="text-xs text-gray-500">
        {mode === "direct" && "直接将输入数据写入文件，会覆盖原文件内容"}
        {mode === "ai" && "通过AI修改原文件内容后写入"}
      </div>
    </div>
  );
};

export default WriteModeSelector;
