import React from "react";
import {
  AINodeConfig,
  FileReaderNodeConfig,
  FileWriterNodeConfig,
  FolderWriterNodeConfig,
  StartNodeConfig,
  EndNodeConfig,
} from "../nodes";

interface NodeConfigProps {
  node: any;
  edges?: any[];
}

const NodeConfig: React.FC<NodeConfigProps> = ({ node, edges = [] }) => {
  if (!node) {
    return (
      <div className="text-center py-12 text-gray-500">
        选择一个节点查看详情
      </div>
    );
  }

  const getNodeTypeName = (type: string) => {
    switch (type) {
      case "start":
        return "开始节点";
      case "end":
        return "结束节点";
      case "ai":
        return "AI 节点";
      case "fileReader":
      case "file_reader":
        return "文件读取节点";
      case "fileWriter":
      case "file_writer":
        return "文件写入节点";
      case "folderWriter":
      case "folder_writer":
        return "文件夹写入节点";
      case "input":
        return "输入节点";
      case "output":
        return "输出节点";
      default:
        return "未知节点";
    }
  };

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
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          {getNodeTypeName(node.type)}
        </h3>
        <p className="text-xs text-gray-500">右键点击节点可编辑配置</p>
      </div>

      <div className="space-y-3">
        {renderReadOnlyField(
          "节点名称",
          node.data?.name || node.data?.label || "未命名",
        )}
        {renderReadOnlyField("节点类型", getNodeTypeName(node.type))}
        {renderReadOnlyField("节点 ID", node.id)}
      </div>

      {node.type === "ai" && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <AINodeConfig node={node} edges={edges} />
        </div>
      )}

      {(node.type === "fileReader" || node.type === "file_reader") && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <FileReaderNodeConfig node={node} />
        </div>
      )}

      {(node.type === "fileWriter" || node.type === "file_writer") && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <FileWriterNodeConfig node={node} />
        </div>
      )}

      {node.type === "start" && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <StartNodeConfig node={node} />
        </div>
      )}

      {node.type === "end" && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <EndNodeConfig node={node} />
        </div>
      )}

      {(node.type === "folderWriter" || node.type === "folder_writer") && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <FolderWriterNodeConfig node={node} />
        </div>
      )}
    </div>
  );
};

export default NodeConfig;
