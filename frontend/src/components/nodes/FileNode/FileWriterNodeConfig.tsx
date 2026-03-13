import React from "react";

interface FileWriterNodeConfigProps {
  node: any;
}

const FileWriterNodeConfig: React.FC<FileWriterNodeConfigProps> = ({
  node,
}) => {
  const renderReadOnlyField = (label: string, value: string) => (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700">
        {value || "-"}
      </div>
    </div>
  );

  const getModeText = (mode: string) => {
    switch (mode) {
      case "direct":
        return "直接写入";
      case "ai":
        return "AI修改";
      default:
        return "直接写入";
    }
  };

  return (
    <div className="space-y-4">
      {renderReadOnlyField("写入模式", getModeText(node.data?.mode))}
      {renderReadOnlyField("文件路径", node.data?.filePath || "")}
      {renderReadOnlyField("编码格式", node.data?.encoding || "utf-8")}
      {renderReadOnlyField("覆盖现有文件", node.data?.overwrite ? "是" : "否")}

      {node.data?.mode === "ai" && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">
            AI修改提示词
          </label>
          <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 min-h-[100px] whitespace-pre-wrap">
            {node.data?.prompt || "-"}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileWriterNodeConfig;
