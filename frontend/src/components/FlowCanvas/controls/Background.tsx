import React from "react";
import { Background as ReactFlowBackground } from "@xyflow/react";

const Background: React.FC = () => {
  return (
    <ReactFlowBackground
      gap={16}
      size={1}
      color="#e2e8f0"
      className="bg-white"
    />
  );
};

export default Background;