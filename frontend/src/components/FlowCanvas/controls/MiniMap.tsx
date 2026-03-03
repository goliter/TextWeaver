import React from "react";
import { MiniMap as ReactFlowMiniMap } from "@xyflow/react";

const MiniMap: React.FC = () => {
  return (
    <ReactFlowMiniMap
      nodeColor={(n) => {
        switch (n.type) {
          case "input":
            return "#6366f1";
          case "output":
            return "#10b981";
          case "ai":
            return "#8b5cf6";
          case "fileReader":
            return "#3b82f6";
          case "fileWriter":
            return "#f97316";
          default:
            return "#94a3b8";
        }
      }}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "1px solid #e2e8f0",
        borderRadius: "0.375rem",
      }}
    />
  );
};

export default MiniMap;