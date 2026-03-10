import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FlowCanvas from "@/components/FlowCanvas";
import Inspector from "@/components/Inspector";
import NodeConfig from "@/components/Inspector/NodeConfig";
import FlowConfig from "@/components/Inspector/FlowConfig";
import ExecutionStatus from "@/components/Inspector/ExecutionStatus";
import { NodeTypeSelector } from "@/components/workflow/NodeTypeSelector";
import NodeEditorDialog from "@/components/workflow/NodeEditorDialog";
import { ConfirmDialog } from "@/components/common";
import TemplateSaveDialog from "@/components/template/TemplateSaveDialog";
import { workflowApi, executionApi } from "@/api/workflow";
import { filesystemApi } from "@/api/filesystem";
import { FileManager } from "@/components/filesystem/FileManager";
import { FileViewer } from "@/components/filesystem/FileViewer";
import { useWebSocket } from "@/services/websocket";
import { getToken } from "@/utils/auth";

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
  const [filesLoading, setFilesLoading] = useState<boolean>(false);
  const [workflowRootFolder, setWorkflowRootFolder] = useState<any>(null);

  // 节点状态管理
  const [nodeStatuses, setNodeStatuses] = useState<{
    [nodeId: string]: "idle" | "running" | "success" | "error";
  }>({});

  // 当前执行ID
  const [currentExecutionId, setCurrentExecutionId] = useState<number | null>(
    null,
  );

  // WebSocket连接
  const token = getToken();
  const { socket, isConnected, onMessage, connectWebSocket } = useWebSocket(
    currentExecutionId,
    token,
  );

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
  const [showSaveTemplateDialog, setShowSaveTemplateDialog] =
    useState<boolean>(false);

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
          sourceHandle: edge.source_handle,
          targetHandle: edge.target_handle,
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
  const loadExecutionData = useCallback(async () => {
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
      alert("加载执行记录失败");
    }
  }, [workflowId, currentPage, pageSize]);

  // 加载文件系统数据
  const loadFileSystemData = useCallback(async () => {
    if (!workflowId) return;

    try {
      setFilesLoading(true);
      // 初始只获取根目录的文件
      const rootFilesData = await filesystemApi.getFiles(
        parseInt(workflowId),
        null, // 根目录
      );
      setFiles(rootFilesData);

      // 查找根文件夹
      const rootFolder = rootFilesData.find(
        (file) => file.parent_id === null && file.type === "folder",
      );
      if (rootFolder) {
        setWorkflowRootFolder(rootFolder);
      } else {
        setWorkflowRootFolder(null);
      }
    } catch (err) {
      console.error("Failed to load file system data:", err);
    } finally {
      setFilesLoading(false);
    }
  }, [workflowId]);

  // 处理WebSocket消息
  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      console.log("WebSocket消息:", message);

      if (message.type === "node_status" && message.node_id !== undefined) {
        const { node_id, status } = message;
        setNodeStatuses((prev) => ({
          ...prev,
          [node_id.toString()]: status as
            | "idle"
            | "running"
            | "success"
            | "error",
        }));
      } else if (message.type === "execution_status") {
        const { status, error, execution_id } = message;
        console.log("执行状态更新:", status, execution_id);

        // 更新执行状态
        setExecution((prev: any) => ({
          ...prev,
          status: status as
            | "pending"
            | "running"
            | "success"
            | "error"
            | "cancelled",
          error_message: error || prev.error_message,
        }));

        // 如果执行完成，更新状态
        if (
          status === "success" ||
          status === "error" ||
          status === "cancelled"
        ) {
          console.log("执行完成:", status);
          // 执行完成，清除节点状态
          setNodeStatuses({});
          setIsExecuting(false);
          // 刷新执行历史记录
          loadExecutionData();
          // 刷新文件系统数据（工作流可能创建了新文件）
          loadFileSystemData();
          // 清除当前执行ID
          setCurrentExecutionId(null);
          // 断开WebSocket连接
          if (socket) {
            console.log("断开WebSocket连接");
            socket.disconnect();
          }
        }
      }
    });

    return unsubscribe;
  }, [onMessage, loadExecutionData, loadFileSystemData, socket]);

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
    // 清除之前的节点状态
    setNodeStatuses({});

    try {
      console.log("开始执行工作流...");
      // 调用执行 API
      const executeResponse = await workflowApi.executeWorkflow(
        parseInt(workflowId),
        {},
      );

      console.log("执行 API 响应:", executeResponse);
      // 获取执行 ID
      const executionId = executeResponse.execution_id;

      console.log("获取到执行 ID:", executionId);
      // 立即建立 WebSocket 连接
      if (token) {
        console.log("token:", token);
        console.log("建立 WebSocket 连接...");
        connectWebSocket(executionId, token);
      } else {
        console.log("token 为 null 或 undefined，无法建立 WebSocket 连接");
      }

      // 设置当前执行ID，用于WebSocket连接
      setCurrentExecutionId(executionId);
      console.log("设置当前执行 ID:", executionId);

      // 设置执行状态
      setExecution({
        id: executionId,
        status: executeResponse.status,
        start_time: executeResponse.start_time,
      });
      console.log("设置执行状态:", executeResponse.status);

      // 切换到执行标签页
      setActiveTab("execution");

      // 立即获取一次执行日志
      const executionLogs = await executionApi.getExecutionLogs(executionId);
      setLogs(executionLogs);
      console.log("获取执行日志:", executionLogs.length, "条");
    } catch (err) {
      console.error("Failed to execute workflow:", err);
      alert("执行工作流失败");
      setIsExecuting(false);
      // 刷新执行历史记录
      loadExecutionData();
      // 清除当前执行ID
      setCurrentExecutionId(null);
    }
  };

  const handleAddNode = (
    position: { x: number; y: number },
    fileData?: any,
  ) => {
    if (fileData) {
      // 如果有文件数据
      if (fileData.type === "folder") {
        // 如果是文件夹，直接创建文件夹写入节点
        handleCreateNode("folderWriter", fileData, position);
      } else {
        // 如果是文件，显示文件节点类型选择对话框
        setDroppedFileData(fileData);
        setDroppedFilePosition(position);
        setShowFileNodeDialog(true);
      }
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
            : nodeType === "folderWriter"
              ? "folder_writer"
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
      } else if (nodeType === "folderWriter") {
        nodeData.data.folderPath = fileData?.path || "";
        nodeData.data.folderId = fileData?.id || "";
      } else if (nodeType === "select") {
        nodeData.data.prompt = "请根据输入数据选择一个输出节点: {{input}}";
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
      case "folderWriter":
        return "文件夹写入节点";
      case "select":
        return "选择节点";
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

  const handleEdgeConnect = async (
    source: string,
    target: string,
    sourceHandle?: string,
    targetHandle?: string,
  ) => {
    if (!workflowId) return;

    // 检查目标节点是否是选择节点，且是否已经有输入连接
    const targetNode = nodes.find((node) => node.id === target);
    if (targetNode?.type === "select" && targetHandle === "top") {
      // 检查是否已经有输入连接
      const existingInputEdges = edges.filter(
        (edge) => edge.target === target && edge.targetHandle === "top",
      );
      if (existingInputEdges.length > 0) {
        alert("选择节点只允许一个输入连接");
        throw new Error("选择节点只允许一个输入连接");
      }
    }

    try {
      const edgeData = {
        source_node_id: parseInt(source),
        target_node_id: parseInt(target),
        source_handle: sourceHandle,
        target_handle: targetHandle,
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
          sourceHandle: newEdge.source_handle,
          targetHandle: newEdge.target_handle,
        },
      ]);
    } catch (err) {
      console.error("Failed to create edge:", err);
      if (
        err instanceof Error &&
        err.message !== "选择节点只允许一个输入连接"
      ) {
        alert("创建连接失败");
      }
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
            onClick={() => setShowSaveTemplateDialog(true)}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
              />
            </svg>
            <span>保存为模板</span>
          </button>
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
            deleteFile={async (fileId, recursive) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              await filesystemApi.deleteFile(
                parseInt(workflowId),
                fileId,
                recursive,
              );
              loadFileSystemData();
              if (selectedFileId === fileId) {
                setSelectedFileId(null);
                setSelectedFile(null);
                setShowFileEditor(false);
              }
            }}
            loadFolderContent={async (folderId) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              return await filesystemApi.getFiles(
                parseInt(workflowId),
                folderId,
              );
            }}
            loadFileContent={async (fileId) => {
              if (!workflowId) throw new Error("Workflow ID not found");
              return await filesystemApi.getFile(parseInt(workflowId), fileId);
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
                nodeStatuses={nodeStatuses}
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
              <NodeConfig node={selectedNode} edges={edges} />
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
        edges={edges}
        flowId={parseInt(workflowId || "0")}
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

      {/* 保存模板弹窗 */}
      <TemplateSaveDialog
        isOpen={showSaveTemplateDialog}
        flowId={parseInt(workflowId || "0")}
        flowName={workflow.name}
        onClose={() => setShowSaveTemplateDialog(false)}
        onSuccess={() => {
          alert("模板保存成功！");
        }}
      />
    </div>
  );
};

export default WorkflowDetail;
