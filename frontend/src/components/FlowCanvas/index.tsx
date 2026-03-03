import React, { useState, useCallback, useRef } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface FlowCanvasProps {
  flowId: number;
  nodes: any[];
  edges: any[];
  onNodesChange: (nodes: any[]) => void;
  onEdgesChange: (edges: any[]) => void;
  onNodeSelect: (nodeId: string) => void;
  onAddNode: (position: { x: number; y: number }) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flowId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
  onAddNode,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const handleNodesChange = useCallback(
    (changes: any[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      onNodesChange(newNodes);
    },
    [nodes, onNodesChange],
  );

  const handleEdgesChange = useCallback(
    (changes: any[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      onEdgesChange(newEdges);
    },
    [edges, onEdgesChange],
  );

  const handleConnect = useCallback(
    (params: any) => {
      const newEdges = addEdge(params, edges);
      onEdgesChange(newEdges);
    },
    [edges, onEdgesChange],
  );

  const handleNodeClick = useCallback(
    (event: any, node: any) => {
      setSelectedNodeId(node.id);
      onNodeSelect(node.id);
      setContextMenu(null);
    },
    [onNodeSelect],
  );

  const handleContextMenu = useCallback((event: any) => {
    event.preventDefault();
    if (reactFlowWrapper.current) {
      const rect = reactFlowWrapper.current.getBoundingClientRect();
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      });
    }
  }, []);

  const handleCreateNode = useCallback(
    (type: string) => {
      if (contextMenu && onAddNode) {
        onAddNode({ x: contextMenu.x - 100, y: contextMenu.y - 50 });
        setContextMenu(null);
      }
    },
    [contextMenu, onAddNode],
  );

  const handleClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  return (
    <div className="w-full h-full" ref={reactFlowWrapper} onClick={handleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handleClick}
        onPaneContextMenu={handleContextMenu}
        fitView
        minZoom={0.5}
        maxZoom={2}
      >
        <Background color="#f0f0f0" gap={16} />
      </ReactFlow>

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="absolute z-50 bg-white rounded-md shadow-lg p-2 border border-gray-200"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <div className="font-medium text-sm text-gray-700 mb-1 px-2">
            新建节点
          </div>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => handleCreateNode("input")}
          >
            输入节点
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => handleCreateNode("ai")}
          >
            AI 节点
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => handleCreateNode("output")}
          >
            输出节点
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => handleCreateNode("fileReader")}
          >
            文件读取节点
          </button>
          <button
            className="w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
            onClick={() => handleCreateNode("fileWriter")}
          >
            文件写入节点
          </button>
        </div>
      )}
    </div>
  );
};

export default FlowCanvas;
