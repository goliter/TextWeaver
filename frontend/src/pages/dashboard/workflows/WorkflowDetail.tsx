import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlowCanvas from "@/components/FlowCanvas";
import Inspector from "@/components/Inspector";
import NodeConfig from "@/components/Inspector/NodeConfig";
import FlowConfig from "@/components/Inspector/FlowConfig";
import ExecutionStatus from "@/components/Inspector/ExecutionStatus";
import { workflowApi } from "@/api/workflow";

const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [activeTab, setActiveTab] = useState<"node" | "flow" | "execution">(
    "node",
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState<any>({
    id: workflowId,
    name: "",
    description: "",
    enabled: true,
    timeout: 300,
  });
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [execution, setExecution] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState<boolean>(false);
  const [newNodePosition, setNewNodePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [newNodeType, setNewNodeType] = useState<string>("input");

  const handleBack = () => {
    navigate("/dashboard/workflows");
  };

  // 加载工作流数据
  useEffect(() => {
    const loadWorkflowData = async () => {
      if (!workflowId) return;

      try {
        setLoading(true);
        setError(null);

        // 获取工作流详情
        const workflowData = await workflowApi.getWorkflow(
          parseInt(workflowId),
        );
        setWorkflow(workflowData);

        // 获取节点
        const nodesData = await workflowApi.getNodes(parseInt(workflowId));
        setNodes(
          nodesData.map((node: any) => ({
            ...node,
            id: node.id.toString(),
            position: {
              x: node.position_x,
              y: node.position_y,
            },
          })),
        );

        // 获取边
        const edgesData = await workflowApi.getEdges(parseInt(workflowId));
        setEdges(
          edgesData.map((edge: any) => ({
            ...edge,
            id: edge.id.toString(),
            source: edge.source.toString(),
            target: edge.target.toString(),
          })),
        );
      } catch (err) {
        console.error("Failed to load workflow data:", err);
        setError("加载工作流数据失败");
      } finally {
        setLoading(false);
      }
    };

    loadWorkflowData();
  }, [workflowId]);

  const handleNodesChange = (newNodes: any[]) => {
    setNodes(newNodes);
  };

  const handleEdgesChange = (newEdges: any[]) => {
    setEdges(newEdges);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setActiveTab("node");
  };

  const handleNodeUpdate = (data: any) => {
    setNodes((prevNodes) => {
      return prevNodes.map((node) => {
        if (node.id === selectedNodeId) {
          return { ...node, data };
        }
        return node;
      });
    });
  };

  const handleWorkflowUpdate = (data: any) => {
    setWorkflow(data);
  };

  const handleExecute = () => {
    // 模拟执行
    setExecution({
      id: 1,
      status: "running",
      started_at: new Date().toISOString(),
    });

    // 模拟日志
    setLogs([
      { timestamp: new Date().toISOString(), message: "工作流开始执行" },
      { timestamp: new Date().toISOString(), message: "正在执行输入节点" },
      { timestamp: new Date().toISOString(), message: "正在执行 AI 节点" },
    ]);

    // 模拟执行完成
    setTimeout(() => {
      setExecution((prev: any) => ({
        ...prev,
        status: "completed",
        ended_at: new Date().toISOString(),
      }));
      setLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          message: "工作流执行完成",
        },
      ]);
    }, 3000);
  };

  const handleAddNode = (position: { x: number; y: number }) => {
    setNewNodePosition(position);
    setShowAddNodeDialog(true);
  };

  const handleCreateNode = async () => {
    if (!workflowId) return;

    try {
      const nodeData: any = {
        node_type: newNodeType,
        name: getNodeLabel(newNodeType),
        position: {
          x: newNodePosition.x,
          y: newNodePosition.y,
        },
        data: {
          label: getNodeLabel(newNodeType),
        },
      };

      // 根据节点类型设置默认数据
      if (newNodeType === "input") {
        nodeData.data.name = "input";
        nodeData.data.type = "text";
      } else if (newNodeType === "output") {
        nodeData.data.name = "output";
        nodeData.data.type = "text";
      } else if (newNodeType === "ai") {
        nodeData.data.model = "gpt-3.5-turbo";
        nodeData.data.prompt = "请总结以下内容: {{input}}";
      } else if (newNodeType === "fileReader") {
        nodeData.data.filePath = "";
        nodeData.data.encoding = "utf-8";
      } else if (newNodeType === "fileWriter") {
        nodeData.data.filePath = "";
        nodeData.data.encoding = "utf-8";
        nodeData.data.overwrite = false;
      }

      const newNode = await workflowApi.createNode(
        parseInt(workflowId),
        nodeData,
      );

      setNodes((prev) => [
        ...prev,
        {
          ...newNode,
          id: newNode.id.toString(),
          position: {
            x: newNode.position.x,
            y: newNode.position.y,
          },
        },
      ]);

      setShowAddNodeDialog(false);
    } catch (err) {
      console.error("Failed to create node:", err);
      alert("创建节点失败");
    }
  };

  const getNodeLabel = (type: string): string => {
    switch (type) {
      case "input":
        return "输入节点";
      case "output":
        return "输出节点";
      case "ai":
        return "AI 节点";
      case "fileReader":
        return "文件读取节点";
      case "fileWriter":
        return "文件写入节点";
      default:
        return "节点";
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!workflowId || !window.confirm("确定要删除这个节点吗？")) return;

    try {
      await workflowApi.deleteNode(parseInt(workflowId), parseInt(nodeId));
      setNodes((prev) => prev.filter((node) => node.id !== nodeId));
      setEdges((prev) =>
        prev.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
      );
      setSelectedNodeId(null);
    } catch (err) {
      console.error("Failed to delete node:", err);
      alert("删除节点失败");
    }
  };

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 border-b border-indigo-100 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="返回工作流列表"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">工作流详情</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExecute}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            执行工作流
          </button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 flex">
        {/* 左侧画布 */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md h-full">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-red-500">{error}</div>
              </div>
            ) : (
              <FlowCanvas
                flowId={parseInt(workflowId || "0")}
                nodes={nodes}
                edges={edges}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onNodeSelect={handleNodeSelect}
                onAddNode={handleAddNode}
              />
            )}
          </div>
        </div>

        {/* 右侧检查器 */}
        <Inspector activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "node" && (
            <NodeConfig
              node={selectedNode}
              onNodeUpdate={handleNodeUpdate}
              onDeleteNode={handleDeleteNode}
            />
          )}
          {activeTab === "flow" && (
            <FlowConfig
              workflow={workflow}
              onWorkflowUpdate={handleWorkflowUpdate}
            />
          )}
          {activeTab === "execution" && (
            <ExecutionStatus
              executionId={execution?.id}
              execution={execution}
              logs={logs}
            />
          )}
        </Inspector>
      </main>

      {/* 添加节点弹窗 */}
      {showAddNodeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              新建节点
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                节点类型
              </label>
              <select
                value={newNodeType}
                onChange={(e) => setNewNodeType(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="input">输入节点</option>
                <option value="ai">AI 节点</option>
                <option value="output">输出节点</option>
                <option value="fileReader">文件读取节点</option>
                <option value="fileWriter">文件写入节点</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddNodeDialog(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreateNode}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetail;
