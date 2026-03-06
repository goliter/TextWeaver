import React from "react";

interface NodeConfigProps {
  node: any;
  onNodeUpdate: (data: any) => void;
  onDeleteNode: (nodeId: string) => void;
}

const NodeConfig: React.FC<NodeConfigProps> = ({
  node,
  //onNodeUpdate,
  onDeleteNode,
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
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {renderReadOnlyField("模型", node.data?.model || "gemini-2.5-flash")}
          <div className="space-y-1">
            <label className="block text-xs font-medium text-gray-500">
              提示词
            </label>
            <div className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-md text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
              {node.data?.prompt || "-"}
            </div>
          </div>
        </div>
      )}

      {/* 文件读取节点特定信息 */}
      {(node.type === "fileReader" || node.type === "file_reader") && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {renderReadOnlyField("文件路径", node.data?.filePath || "-")}
          {renderReadOnlyField("编码", node.data?.encoding || "utf-8")}
        </div>
      )}

      {/* 文件写入节点特定信息 */}
      {(node.type === "fileWriter" || node.type === "file_writer") && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {renderReadOnlyField("文件路径", node.data?.filePath || "-")}
          {renderReadOnlyField("编码", node.data?.encoding || "utf-8")}
          {renderReadOnlyField("覆盖模式", node.data?.overwrite ? "是" : "否")}
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
