import React, { useState, useEffect } from "react";
import PromptEditor from "../AINode/PromptEditor";
import DataSourceManager from "../AINode/DataSourceManager";
import FileSelector from "../FileNode/FileSelector";
import WriteModeSelector from "../FileNode/WriteModeSelector";
import AIPromptEditor from "../FileNode/AIPromptEditor";

interface NodeConfigProps {
  node: any;
  onNodeUpdate: (data: any) => void;
  onDeleteNode: (nodeId: string) => void;
  edges?: any[];
}

const NodeConfig: React.FC<NodeConfigProps> = ({
  node,
  onNodeUpdate,
  onDeleteNode,
  edges = [],
}) => {
  if (!node) {
    return (
      <div className="text-center py-12 text-gray-500">
        选择一个节点查看详情
      </div>
    );
  }

  // 获取节点类型显示名称
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
      case "input":
        return "输入节点";
      case "output":
        return "输出节点";
      default:
        return "未知节点";
    }
  };

  // 分析AI节点的数据源
  const analyzeDataSources = () => {
    if (node.type !== "ai") {
      return { topInputs: [], leftInputs: [] };
    }

    const topInputs: any[] = [];
    const leftInputs: any[] = [];

    edges.forEach((edge) => {
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

  // 渲染只读字段
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

      {/* 通用信息 */}
      <div className="space-y-3">
        {renderReadOnlyField(
          "节点名称",
          node.data?.name || node.data?.label || "未命名",
        )}
        {renderReadOnlyField("节点类型", getNodeTypeName(node.type))}
        {renderReadOnlyField("节点 ID", node.id)}
      </div>

      {/* AI 节点特定信息 */}
      {node.type === "ai" && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <DataSourceManager topInputs={topInputs} leftInputs={leftInputs} />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              模型
            </label>
            <select
              value={node.data?.model || "gemini-2.5-flash"}
              onChange={(e) =>
                onNodeUpdate({
                  ...node.data,
                  model: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>
          <PromptEditor
            value={node.data?.prompt || ""}
            onChange={(value) =>
              onNodeUpdate({
                ...node.data,
                prompt: value,
              })
            }
            variables={[...topInputs, ...leftInputs]}
          />
        </div>
      )}

      {/* 文件读取节点特定信息 */}
      {(node.type === "fileReader" || node.type === "file_reader") && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              文件路径
            </label>
            <FileSelector
              value={node.data?.filePath || ""}
              onChange={(value) =>
                onNodeUpdate({
                  ...node.data,
                  filePath: value,
                })
              }
              onFileSelect={(fileId, filePath) =>
                onNodeUpdate({
                  ...node.data,
                  fileId,
                  filePath,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              编码格式
            </label>
            <select
              value={node.data?.encoding || "utf-8"}
              onChange={(e) =>
                onNodeUpdate({
                  ...node.data,
                  encoding: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utf-8">UTF-8</option>
              <option value="gbk">GBK</option>
              <option value="ascii">ASCII</option>
            </select>
          </div>
        </div>
      )}

      {/* 文件写入节点特定信息 */}
      {(node.type === "fileWriter" || node.type === "file_writer") && (
        <div className="space-y-4 pt-3 border-t border-gray-200">
          <WriteModeSelector
            mode={(node.data?.mode || "direct") as "direct" | "ai"}
            onChange={(mode) =>
              onNodeUpdate({
                ...node.data,
                mode,
              })
            }
          />
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              文件路径
            </label>
            <FileSelector
              value={node.data?.filePath || ""}
              onChange={(value) =>
                onNodeUpdate({
                  ...node.data,
                  filePath: value,
                })
              }
              onFileSelect={(fileId, filePath) =>
                onNodeUpdate({
                  ...node.data,
                  fileId,
                  filePath,
                })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-2">
              编码格式
            </label>
            <select
              value={node.data?.encoding || "utf-8"}
              onChange={(e) =>
                onNodeUpdate({
                  ...node.data,
                  encoding: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="utf-8">UTF-8</option>
              <option value="gbk">GBK</option>
              <option value="ascii">ASCII</option>
            </select>
          </div>
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={node.data?.overwrite || false}
                onChange={(e) =>
                  onNodeUpdate({
                    ...node.data,
                    overwrite: e.target.checked,
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">
                覆盖现有文件
              </span>
            </label>
          </div>
          {node.data?.mode === "ai" && (
            <AIPromptEditor
              value={node.data?.aiPrompt || ""}
              onChange={(value) =>
                onNodeUpdate({
                  ...node.data,
                  aiPrompt: value,
                })
              }
            />
          )}
        </div>
      )}

      {/* 删除节点按钮 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => onDeleteNode(node.id)}
          className="w-full px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          删除节点
        </button>
      </div>
    </div>
  );
};

export default NodeConfig;
