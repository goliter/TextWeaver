import React from "react";
import { Controls as ReactFlowControls } from "@xyflow/react";

const Controls: React.FC = () => {
  return (
    <ReactFlowControls
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        border: "1px solid #e2e8f0",
        borderRadius: "0.375rem",
      }}
    />
  );
};

export default Controls;