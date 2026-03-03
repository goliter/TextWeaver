import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlowCanvas from "@/components/FlowCanvas";
import Inspector from "@/components/Inspector";
import NodeConfig from "@/components/Inspector/NodeConfig";
import FlowConfig from "@/components/Inspector/FlowConfig";
import ExecutionStatus from "@/components/Inspector/ExecutionStatus";

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
    name: "测试工作流",
    description: "这是一个测试工作流",
    enabled: true,
    timeout: 300,
  });
  const [nodes, setNodes] = useState<any[]>([
    {
      id: "n1",
      type: "input",
      position: { x: 100, y: 200 },
      data: { label: "输入节点", name: "input", type: "text" },
    },
    {
      id: "n2",
      type: "ai",
      position: { x: 350, y: 200 },
      data: {
        label: "AI 节点",
        model: "gpt-3.5-turbo",
        prompt: "请总结以下内容: {{input}}",
      },
    },
    {
      id: "n3",
      type: "output",
      position: { x: 600, y: 200 },
      data: { label: "输出节点", name: "output", type: "text" },
    },
  ]);
  const [edges, setEdges] = useState<any[]>([
    { id: "e1", source: "n1", target: "n2" },
    { id: "e2", source: "n2", target: "n3" },
  ]);
  const [execution, setExecution] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const handleBack = () => {
    navigate("/dashboard/workflows");
  };

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
            <FlowCanvas
              flowId={parseInt(workflowId || "0")}
              nodes={nodes}
              edges={edges}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onNodeSelect={handleNodeSelect}
            />
          </div>
        </div>

        {/* 右侧检查器 */}
        <Inspector activeTab={activeTab} onTabChange={setActiveTab}>
          {activeTab === "node" && (
            <NodeConfig node={selectedNode} onNodeUpdate={handleNodeUpdate} />
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
    </div>
  );
};

export default WorkflowDetail;
