import React, { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ContextMenu, type MenuItem } from "@/components/common";
import {
  StartNode,
  EndNode,
  AINode,
  FileReaderNode,
  FileWriterNode,
  FolderWriterNode,
} from "../nodes";

interface FlowCanvasProps {
  flowId: number;
  nodes: any[];
  edges: any[];
  onNodesChange: (nodes: any[]) => void;
  onEdgesChange: (edges: any[]) => void;
  onNodeSelect: (nodeId: string) => void;
  onAddNode: (position: { x: number; y: number }, fileData?: any) => void;
  onEdgeConnect: (
    source: string,
    target: string,
    sourceHandle?: string,
    targetHandle?: string,
  ) => Promise<void>;
  onEdgeDelete: (edgeId: string) => Promise<void>;
  onNodeDelete: (nodeId: string) => Promise<void>;
  onNodeEdit: (nodeId: string) => void;
  onNodeDragStop?: (
    nodeId: string,
    position: { x: number; y: number },
  ) => Promise<void>;
}

type ContextMenuType = "canvas" | "edge" | "node" | null;

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onAddNode,
  onEdgeConnect,
  onEdgeDelete,
  onNodeDelete,
  onNodeEdit,
  onNodeDragStop,
}) => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: ContextMenuType;
    edgeId?: string;
    nodeId?: string;
  } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // 注册自定义节点类型
  const nodeTypes: any = {
    start: StartNode,
    end: EndNode,
    ai: AINode,
    file_reader: FileReaderNode,
    file_writer: FileWriterNode,
    folder_writer: FolderWriterNode,
  };

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      onNodesChange(newNodes);
    },
    [nodes, onNodesChange],
  );

  const handleConnect = useCallback(
    async (params: any) => {
      if (onEdgeConnect) {
        try {
          await onEdgeConnect(
            params.source,
            params.target,
            params.sourceHandle,
            params.targetHandle,
          );
        } catch (err) {
          console.error("Failed to create edge:", err);
        }
      }
    },
    [onEdgeConnect],
  );

  const handleEdgesChange = useCallback(
    async (changes: any[]) => {
      const removeChanges = changes.filter(
        (change) => change.type === "remove",
      );
      for (const change of removeChanges) {
        if (onEdgeDelete && change.id) {
          try {
            await onEdgeDelete(change.id);
          } catch (err) {
            console.error("Failed to delete edge:", err);
          }
        }
      }
      const newEdges = applyEdgeChanges(changes, edges);
      onEdgesChange(newEdges);
    },
    [edges, onEdgesChange, onEdgeDelete],
  );

  const handleNodeClick = useCallback(
    (_event: any, node: any) => {
      onNodeSelect(node.id);
      setContextMenu(null);
    },
    [onNodeSelect],
  );

  // 节点拖拽停止
  const handleNodeDragStop = useCallback(
    async (_event: any, node: any) => {
      if (onNodeDragStop) {
        try {
          await onNodeDragStop(node.id, node.position);
        } catch (err) {
          console.error("Failed to save node position:", err);
        }
      }
    },
    [onNodeDragStop],
  );

  // 画布右键菜单
  const handlePaneContextMenu = useCallback((event: any) => {
    event.preventDefault();
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        type: "canvas",
      });
    }
  }, []);

  // 处理文件拖拽到画布的事件
  const handlePaneDrop = useCallback(
    (event: any) => {
      event.preventDefault();
      try {
        // 尝试从拖拽数据中获取文件信息
        const fileDataJson = event.dataTransfer.getData("application/json");
        if (fileDataJson) {
          const fileData = JSON.parse(fileDataJson);
          // 支持文件和文件夹拖拽
          if (
            fileData &&
            (fileData.type === "file" || fileData.type === "folder")
          ) {
            // 计算拖拽位置在画布中的坐标
            if (reactFlowWrapper.current) {
              const rect = reactFlowWrapper.current.getBoundingClientRect();
              const x = event.clientX - rect.left;
              const y = event.clientY - rect.top;

              // 触发文件节点创建
              if (onAddNode) {
                onAddNode({ x: x - 100, y: y - 50 }, fileData);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to handle file drop:", err);
      }
    },
    [onAddNode],
  );

  // 处理拖拽悬停事件
  const handlePaneDragOver = useCallback((event: any) => {
    event.preventDefault();
  }, []);

  // 边的右键菜单
  const handleEdgeContextMenu = useCallback((event: any, edge: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        type: "edge",
        edgeId: edge.id,
      });
    }
  }, []);

  // 节点的右键菜单
  const handleNodeContextMenu = useCallback((event: any, node: any) => {
    event.preventDefault();
    event.stopPropagation();
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        type: "node",
        nodeId: node.id,
      });
    }
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleAddNodeClick = useCallback(() => {
    if (contextMenu && onAddNode) {
      onAddNode({ x: contextMenu.x - 100, y: contextMenu.y - 50 });
      setContextMenu(null);
    }
  }, [contextMenu, onAddNode]);

  const handleDeleteEdgeClick = useCallback(() => {
    if (contextMenu?.edgeId && onEdgeDelete) {
      onEdgeDelete(contextMenu.edgeId);
      setContextMenu(null);
    }
  }, [contextMenu, onEdgeDelete]);

  // 画布右键菜单项
  const canvasMenuItems: MenuItem[] = [
    {
      label: "添加节点",
      onClick: handleAddNodeClick,
      icon: (
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
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
    },
  ];

  // 边右键菜单项
  const edgeMenuItems: MenuItem[] = [
    {
      label: "删除连接",
      onClick: handleDeleteEdgeClick,
      danger: true,
      icon: (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  // 节点右键菜单项
  const handleDeleteNodeClick = useCallback(async () => {
    if (contextMenu?.nodeId && onNodeDelete) {
      try {
        await onNodeDelete(contextMenu.nodeId);
      } catch (err) {
        console.error("Failed to delete node:", err);
      }
    }
  }, [contextMenu, onNodeDelete]);

  const nodeMenuItems: MenuItem[] = [
    {
      label: "修改节点",
      onClick: () => {
        if (contextMenu?.nodeId && onNodeEdit) {
          onNodeEdit(contextMenu.nodeId);
        }
      },
      icon: (
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
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
      ),
    },
    {
      label: "删除节点",
      onClick: handleDeleteNodeClick,
      danger: true,
      icon: (
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      className="w-full h-full"
      ref={reactFlowWrapper}
      onClick={handleCloseContextMenu}
      onDrop={handlePaneDrop}
      onDragOver={handlePaneDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onNodeContextMenu={handleNodeContextMenu}
        onNodeDragStop={handleNodeDragStop}
        onEdgeContextMenu={handleEdgeContextMenu}
        onPaneClick={handleCloseContextMenu}
        onPaneContextMenu={handlePaneContextMenu}
        fitView
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#f0f0f0" gap={16} />
      </ReactFlow>

      {/* 右键菜单 */}
      {contextMenu && contextMenu.type === "canvas" && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          title="工作流操作"
          items={canvasMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}

      {contextMenu && contextMenu.type === "edge" && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          title="连接操作"
          items={edgeMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}

      {contextMenu && contextMenu.type === "node" && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          title="节点操作"
          items={nodeMenuItems}
          onClose={handleCloseContextMenu}
        />
      )}
    </div>
  );
};

export default FlowCanvas;
