import React, { useState, useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface FlowCanvasProps {
  flowId: number;
  nodes: any[];
  edges: any[];
  onNodesChange: (nodes: any[]) => void;
  onEdgesChange: (edges: any[]) => void;
  onNodeSelect: (nodeId: string) => void;
}

const FlowCanvas: React.FC<FlowCanvasProps> = ({
  flowId,
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodeSelect,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

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
    },
    [onNodeSelect],
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        fitView
        minZoom={0.5}
        maxZoom={2}
      />
    </div>
  );
};

export default FlowCanvas;
