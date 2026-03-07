import React from "react";

interface AIPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const AIPromptEditor: React.FC<AIPromptEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        AI修改提示词
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={6}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 font-mono"
        placeholder="请输入提示词，例如：\n\n请根据以下内容修改文件：\n\n原文件内容: {file_content}\n\n新数据: {input_data}\n\n请修改原文件内容，保留原有格式..."
      />
      <div className="text-xs text-gray-500">
        <div className="font-medium mb-1">可用变量：</div>
        <div className="space-y-1">
          <div><code>{`{file_content}`}</code> - 原文件内容</div>
          <div><code>{`{input_data}`}</code> - 输入数据</div>
        </div>
      </div>
    </div>
  );
};

export default AIPromptEditor;
