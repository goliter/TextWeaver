import React from "react";

interface InspectorProps {
  activeTab: "node" | "flow" | "execution" | "file";
  onTabChange: (tab: "node" | "flow" | "execution" | "file") => void;
  children: React.ReactNode;
}

const Inspector: React.FC<InspectorProps> = ({
  activeTab,
  onTabChange,
  children,
}) => {
  return (
    <div className="w-80 h-full border-l border-gray-200 bg-white">
      <div className="border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => onTabChange("node")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "node" ? "bg-gray-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            节点配置
          </button>
          <button
            onClick={() => onTabChange("flow")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "flow" ? "bg-gray-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            工作流配置
          </button>
          <button
            onClick={() => onTabChange("execution")}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === "execution" ? "bg-gray-50 text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
          >
            执行状态
          </button>
        </div>
      </div>
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">{children}</div>
    </div>
  );
};

export default Inspector;
