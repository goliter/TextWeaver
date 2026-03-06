import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlowCanvas from "@/components/FlowCanvas";
import Inspector from "@/components/Inspector";
import NodeConfig from "@/components/Inspector/NodeConfig";
import FlowConfig from "@/components/Inspector/FlowConfig";
import ExecutionStatus from "@/components/Inspector/ExecutionStatus";
import { NodeTypeSelector } from "@/components/workflow/NodeTypeSelector";
import NodeEditorDialog from "@/components/workflow/NodeEditorDialog";
import { ConfirmDialog } from "@/components/common";
import { workflowApi, executionApi } from "@/api/workflow";
import { filesystemApi } from "@/api/filesystem";
import { FileManager } from "@/components/filesystem/FileManager";
import { FileViewer } from "@/components/filesystem/FileViewer";

const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  // 状态管理
  const [activeTab, setActiveTab] = useState<
    "node" | "flow" | "execution" | "file"
  >("node");
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [showFileEditor, setShowFileEditor] = useState<boolean>(false);
  const [showFileNodeDialog, setShowFileNodeDialog] = useState<boolean>(false);
  const [droppedFileData, setDroppedFileData] = useState<any>(null);
  const [droppedFilePosition, setDroppedFilePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
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
  const [executions, setExecutions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalExecutions, setTotalExecutions] = useState<number>(0);
  const [pageSize] = useState<number>(5);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [showAddNodeDialog, setShowAddNodeDialog] = useState<boolean>(false);
  const [newNodePosition, setNewNodePosition] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [nodeEditor, setNodeEditor] = useState<{
    isOpen: boolean;
    node: any | null;
  }>({
    isOpen: false,
    node: null,
  });
  const [files, setFiles] = useState<any[]>([]);
  const [allFiles, setAllFiles] = useState<any[]>([]);
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [workflowRootFolder, setWorkflowRootFolder] = useState<any>(null);

  // 确认框状态
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const handleBack = () => {
    navigate("/dashboard/workflows");
  };

  // 加载工作流基本数据（工作流详情、节点、边）
  const loadWorkflowBasicData = async () => {
    if (!workflowId) return;

    try {
      setLoading(true);
      setError(null);

      // 获取工作流详情
      const workflowData = await workflowApi.getWorkflow(parseInt(workflowId));
      setWorkflow(workflowData);

      // 获取节点
      const nodesData = await workflowApi.getNodes(parseInt(workflowId));
      setNodes(
        nodesData.map((node: any) => ({
          ...node,
          id: node.id.toString(),
          type: node.node_type,
          position: {
            x: node.position?.x ?? 0,
            y: node.position?.y ?? 0,
          },
        })),
      );

      // 获取边
      const edgesData = await workflowApi.getEdges(parseInt(workflowId));
      setEdges(
        edgesData.map((edge: any) => ({
          ...edge,
          id: edge.id.toString(),
          source:
            edge.source_node_id?.toString() ?? edge.source?.toString() ?? "",
          target:
            edge.target_node_id?.toString() ?? edge.target?.toString() ?? "",
        })),
      );
    } catch (err) {
      console.error("Failed to load workflow basic data:", err);
      setError("加载工作流数据失败");
    } finally {
      setLoading(false);
    }
  };

  // 加载执行记录数据
  const loadExecutionData = async () => {
    if (!workflowId) return;

    try {
      // 获取总执行次数
      const totalRecords = await workflowApi.getExecutionCount(
        parseInt(workflowId),
      );
      setTotalExecutions(totalRecords);

      // 获取当前页的执行记录
      const skip = (currentPage - 1) * pageSize;
      const executionsData = await workflowApi.getExecutionHistory(
        parseInt(workflowId),
        skip,
        pageSize,
      );
      setExecutions(executionsData);

      // 计算总页数
      setTotalPages(Math.ceil(totalRecords / pageSize));

      // 如果有执行记录，默认选中第一条但不加载日志
      if (executionsData.length > 0) {
        const latestExecution = executionsData[0];
        setExecution(latestExecution);
      }
    } catch (err) {
      console.error("Failed to load execution data:", err);
    }
  };

  // 加载文件系统数据
  const loadFileSystemData = async () => {
    if (!workflowId) return;

    try {
      setFilesLoading(true);
      // 获取所有文件
      const allFilesData = await filesystemApi.getAllFiles(
        parseInt(workflowId),
      );
      setAllFiles(allFilesData);

      // 构建文件树结构
      const fileMap: { [key: number]: any } = {};
      let rootFolder: any = null;

      // 首先创建所有文件的映射
      allFilesData.forEach((file) => {
        fileMap[file.id] = { ...file, children: [] };
      });

      // 然后构建文件树
      allFilesData.forEach((file) => {
        if (file.parent_id === null && file.type === "folder") {
          // 根文件夹 - 确保只设置一次，避免被其他文件覆盖
          if (!rootFolder) {
            rootFolder = fileMap[file.id];
          }
        } else {
          // 子文件/文件夹
          if (file.parent_id !== null && fileMap[file.parent_id]) {
            fileMap[file.parent_id].children.push(fileMap[file.id]);
          }
        }
      });

      // 只显示根文件夹内的内容
      if (rootFolder) {
        // 保存根文件夹信息，用于显示在资源管理器标题中
        setWorkflowRootFolder(rootFolder);
        // 只显示根文件夹内的内容
        setFiles(rootFolder.children || []);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Failed to load file system data:", err);
    } finally {
      setFilesLoading(false);
    }
  };

  // 当工作流ID变化时，加载工作流基本数据和文件系统数据
  useEffect(() => {
    loadWorkflowBasicData();
    loadFileSystemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // 当页码变化时，只加载执行记录数据
  useEffect(() => {
    loadExecutionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId, currentPage]);

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

  const handleNodeUpdate = async (data: any, nodeId?: string) => {
    const targetNodeId = nodeId || selectedNodeId;
    if (!targetNodeId || !workflowId) return;

    try {
      // 调用后端 API 更新节点
      await workflowApi.updateNode(
        parseInt(workflowId),
        parseInt(targetNodeId),
        { data },
      );

      // 更新前端状态
      setNodes((prevNodes) => {
        return prevNodes.map((node) => {
          if (node.id === targetNodeId) {
            return { ...node, data };
          }
          return node;
        });
      });
    } catch (err) {
      console.error("Failed to update node:", err);
      alert("更新节点失败");
    }
  };

  // 编辑节点
  const handleNodeEdit = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node) {
      setNodeEditor({
        isOpen: true,
        node: node,
      });
    }
  };

  const handleWorkflowUpdate = (data: any) => {
    setWorkflow(data);
  };

  // 选择执行记录
  const handleSelectExecution = async (executionId: number) => {
    try {
      // 获取执行详情
      const executionDetail = await executionApi.getExecution(executionId);
      setExecution(executionDetail);

      // 获取执行日志
      const executionLogs = await executionApi.getExecutionLogs(executionId);
      setLogs(executionLogs);
    } catch (err) {
      console.error("Failed to get execution details:", err);
      alert("获取执行详情失败");
    }
  };

  // 切换分页
  const handlePageChange = async (page: number) => {
    if (!workflowId) return;

    try {
      setCurrentPage(page);
      const skip = (page - 1) * pageSize;
      const executionsData = await workflowApi.getExecutionHistory(
        parseInt(workflowId),
        skip,
        pageSize,
      );
      setExecutions(executionsData);

      // 如果有执行记录，默认选中第一条但不加载日志
      if (executionsData.length > 0) {
        const latestExecution = executionsData[0];
        setExecution(latestExecution);
        // 清空日志，等待用户点击后再加载
        setLogs([]);
      } else {
        // 没有执行记录时清空状态
        setExecution(null);
        setLogs([]);
      }
    } catch (err) {
      console.error("Failed to load executions:", err);
      alert("加载执行记录失败");
    }
  };

  const handleExecute = async () => {
    if (!workflowId || isExecuting) return;

    setIsExecuting(true);

    try {
      // 调用执行 API
      const executeResponse = await workflowApi.executeWorkflow(
        parseInt(workflowId),
        {},
      );

      // 设置执行状态
      setExecution({
        id: executeResponse.execution_id,
        status: executeResponse.status,
        start_time: executeResponse.start_time,
      });

      // 切换到执行标签页
      setActiveTab("execution");

      // 立即获取一次执行日志
      const executionLogs = await executionApi.getExecutionLogs(
        executeResponse.execution_id,
      );
      setLogs(executionLogs);

      // 轮询获取执行状态和日志
      const pollInterval = setInterval(async () => {
        try {
          // 获取执行详情
          const executionDetail = await executionApi.getExecution(
            executeResponse.execution_id,
          );
          setExecution(executionDetail);

          // 获取执行日志
          const executionLogs = await executionApi.getExecutionLogs(
            executeResponse.execution_id,
          );
          setLogs(executionLogs);

          // 如果执行完成，停止轮询并更新执行状态
          if (
            executionDetail.status === "success" ||
            executionDetail.status === "error" ||
            executionDetail.status === "cancelled"
          ) {
            clearInterval(pollInterval);
            setIsExecuting(false);
            // 刷新执行历史记录
            loadExecutionData();
          }
        } catch (err) {
          console.error("Failed to get execution status:", err);
          clearInterval(pollInterval);
          setIsExecuting(false);
        }
      }, 1000); // 每秒轮询一次
    } catch (err) {
      console.error("Failed to execute workflow:", err);
      alert("执行工作流失败");
      setIsExecuting(false);
    }
  };

  const handleAddNode = (
    position: { x: number; y: number },
    fileData?: any,
  ) => {
    if (fileData) {
      // 如果有文件数据，显示文件节点类型选择对话框
      setDroppedFileData(fileData);
      setDroppedFilePosition(position);
      setShowFileNodeDialog(true);
    } else {
      // 否则显示节点创建对话框
      setNewNodePosition(position);
      setShowAddNodeDialog(true);
    }
  };

  const handleCreateNode = async (
    nodeType: string,
    fileData?: any,
    position?: { x: number; y: number },
  ) => {
    if (!workflowId) return;

    try {
      // 转换节点类型名称为后端格式
      const backendNodeType =
        nodeType === "fileReader"
          ? "file_reader"
          : nodeType === "fileWriter"
            ? "file_writer"
            : nodeType;

      const nodeData: any = {
        node_type: backendNodeType,
        name: fileData?.name || getNodeLabel(nodeType),
        position: position || {
          x: newNodePosition.x,
          y: newNodePosition.y,
        },
        data: {
          label: fileData?.name || getNodeLabel(nodeType),
        },
      };

      // 根据节点类型设置默认数据
      if (nodeType === "start") {
        nodeData.data.name = "start";
      } else if (nodeType === "end") {
        nodeData.data.name = "end";
      } else if (nodeType === "ai") {
        nodeData.data.model = "gpt-3.5-turbo";
        nodeData.data.prompt = "请总结以下内容: {{input}}";
      } else if (nodeType === "fileReader") {
        nodeData.data.filePath = fileData?.path || "";
        nodeData.data.encoding = "utf-8";
      } else if (nodeType === "fileWriter") {
        nodeData.data.filePath = fileData?.path || "";
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
          type: newNode.node_type, // 添加 type 属性
          position: {
            x: newNode.position?.x ?? 0,
            y: newNode.position?.y ?? 0,
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
      case "start":
        return "开始节点";
      case "end":
        return "结束节点";
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
    if (!workflowId) return;

    return new Promise<void>((resolve) => {
      const node = nodes.find((n) => n.id === nodeId);
      setConfirmDialog({
        isOpen: true,
        title: "删除节点",
        message: `确定要删除节点 "${node?.data?.label || node?.name || "未命名节点"}" 吗？相关的连接也会被删除。`,
        danger: true,
        onConfirm: async () => {
          try {
            await workflowApi.deleteNode(
              parseInt(workflowId),
              parseInt(nodeId),
            );
            setNodes((prev) => prev.filter((node) => node.id !== nodeId));
            setEdges((prev) =>
              prev.filter(
                (edge) => edge.source !== nodeId && edge.target !== nodeId,
              ),
            );
            setSelectedNodeId(null);
          } catch (err) {
            console.error("Failed to delete node:", err);
            alert("删除节点失败");
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          resolve();
        },
      });
    });
  };

  const handleEdgeConnect = async (source: string, target: string) => {
    if (!workflowId) return;

    try {
      const edgeData = {
        source_node_id: parseInt(source),
        target_node_id: parseInt(target),
      };
      const newEdge = await workflowApi.createEdge(
        parseInt(workflowId),
        edgeData,
      );
      // 将新边的ID添加到本地状态
      setEdges((prev) => [
        ...prev,
        {
          ...newEdge,
          id: newEdge.id.toString(),
          source: newEdge.source_node_id.toString(),
          target: newEdge.target_node_id.toString(),
        },
      ]);
    } catch (err) {
      console.error("Failed to create edge:", err);
      alert("创建连接失败");
      throw err;
    }
  };

  const handleEdgeDelete = async (edgeId: string) => {
    if (!workflowId) return;

    return new Promise<void>((resolve) => {
      setConfirmDialog({
        isOpen: true,
        title: "删除连接",
        message: "确定要删除这条连接吗？",
        danger: true,
        onConfirm: async () => {
          try {
            await workflowApi.deleteEdge(
              parseInt(workflowId),
              parseInt(edgeId),
            );
            setEdges((prev) => prev.filter((edge) => edge.id !== edgeId));
          } catch (err) {
            console.error("Failed to delete edge:", err);
            alert("删除连接失败");
          }
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          resolve();
        },
      });
    });
  };

  // 保存节点位置
  const handleNodeDragStop = async (
    nodeId: string,
    position: { x: number; y: number },
  ) => {
    if (!workflowId) return;

    try {
      await workflowApi.updateNode(parseInt(workflowId), parseInt(nodeId), {
        position: position,
      });
    } catch (err) {
      console.error("Failed to save node position:", err);
      throw err;
    }
  };

  // 文件操作处理函数
  const handleFileUpdate = async (fileId: number, content: string) => {
    if (!workflowId) return;

    try {
      const updatedFile = await filesystemApi.updateFile(
        parseInt(workflowId),
        fileId,
        {
          content: content,
        },
      );
      setSelectedFile(updatedFile);
      // 刷新文件树
      loadFileSystemData();
    } catch (err) {
      console.error("Failed to update file:", err);
    }
  };

  const selectedNode = selectedNodeId
    ? nodes.find((node) => node.id === selectedNodeId)
    : null;

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
            disabled={isExecuting}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
              isExecuting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {isExecuting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>执行中...</span>
              </>
            ) : (
              <span>执行工作流</span>
            )}
          </button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="flex-1 flex">
        {/* 左侧文件系统 */}
        <div className="w-64 border-r border-gray-200 bg-white">
          <FileManager
            onFileSelect={(file) => {
              if (file) {
                setSelectedFile(file);
                setSelectedFileId(file.id);
                setShowFileEditor(true);
              } else {
                setSelectedFile(null);
                setSelectedFileId(null);
              }
            }}
            selectedFile={selectedFile}
            files={files}
            allFiles={allFiles}
            loading={filesLoading}
            error={null}
            rootFolderName={workflowRootFolder?.name}
            createFile={async (fileData) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              // 如果parent_id为null，使用根文件夹的ID作为parent_id
              const fileDataWithParent = {
                ...fileData,
                parent_id: fileData.parent_id || workflowRootFolder?.id,
              };
              const createdFile = await filesystemApi.createFile(
                parseInt(workflowId),
                fileDataWithParent,
              );
              loadFileSystemData();
              return createdFile;
            }}
            updateFile={async (fileId, fileData) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              const updatedFile = await filesystemApi.updateFile(
                parseInt(workflowId),
                fileId,
                fileData,
              );
              loadFileSystemData();
              return updatedFile;
            }}
            deleteFile={async (fileId) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              await filesystemApi.deleteFile(parseInt(workflowId), fileId);
              loadFileSystemData();
              if (selectedFileId === fileId) {
                setSelectedFileId(null);
                setSelectedFile(null);
                setShowFileEditor(false);
              }
            }}
          />
        </div>

        {/* 中间工作流画布 */}
        <div className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow-md h-full">
            {showFileEditor && selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">
                    文件编辑区
                  </h2>
                  <button
                    onClick={() => setShowFileEditor(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    返回流水线
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-auto">
                  <FileViewer
                    file={selectedFile}
                    onSave={handleFileUpdate}
                    loading={filesLoading}
                  />
                </div>
              </div>
            ) : loading ? (
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
                onEdgeConnect={handleEdgeConnect}
                onEdgeDelete={handleEdgeDelete}
                onNodeDelete={handleDeleteNode}
                onNodeEdit={handleNodeEdit}
                onNodeDragStop={handleNodeDragStop}
              />
            )}
          </div>
        </div>

        {/* 右侧检查器 */}
        <div className="w-80 border-l border-gray-200 bg-white">
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
                executions={executions}
                currentPage={currentPage}
                totalPages={totalPages}
                totalExecutions={totalExecutions}
                onSelectExecution={handleSelectExecution}
                onPageChange={handlePageChange}
              />
            )}
            {activeTab === "file" && selectedFile && (
              <div className="p-4 space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    {selectedFile.name}
                  </h3>
                  <div className="text-sm text-gray-500 mb-4">
                    类型: {selectedFile.type === "file" ? "文件" : "文件夹"} •
                    大小: {selectedFile.size} 字节
                  </div>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500">点击文件在中间查看内容</p>
                </div>
              </div>
            )}
          </Inspector>
        </div>
      </main>

      {/* 节点选择器弹窗 */}
      <NodeTypeSelector
        isOpen={showAddNodeDialog}
        onSelect={(type) => {
          handleCreateNode(type);
        }}
        onCancel={() => setShowAddNodeDialog(false)}
      />

      {/* 确认框 */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        danger={confirmDialog.danger}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />

      {/* 节点编辑弹窗 */}
      <NodeEditorDialog
        isOpen={nodeEditor.isOpen}
        node={nodeEditor.node}
        onSave={(data) => {
          if (nodeEditor.node) {
            handleNodeUpdate(data, nodeEditor.node.id);
          }
          setNodeEditor({ isOpen: false, node: null });
        }}
        onCancel={() => setNodeEditor({ isOpen: false, node: null })}
      />

      {/* 文件节点类型选择对话框 */}
      {showFileNodeDialog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              创建文件节点
            </h3>
            <p className="text-gray-600 mb-6">请选择要创建的文件节点类型：</p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  handleCreateNode(
                    "fileReader",
                    droppedFileData,
                    droppedFilePosition,
                  );
                  setShowFileNodeDialog(false);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                文件读取节点
              </button>
              <button
                onClick={() => {
                  handleCreateNode(
                    "fileWriter",
                    droppedFileData,
                    droppedFilePosition,
                  );
                  setShowFileNodeDialog(false);
                }}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                文件写入节点
              </button>
              <button
                onClick={() => setShowFileNodeDialog(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowDetail;
