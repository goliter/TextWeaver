import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateList from "@/components/template/TemplateList";
import TemplateMarket from "./TemplateMarket";

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my" | "market">("my");

  const handleUseTemplate = (flowId: number) => {
    navigate(`/dashboard/workflows/${flowId}`);
  };

  return (
    <div className="h-full flex flex-col">

      {/* 标签页 */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("my")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "my"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            我的模板
          </button>
          <button
            onClick={() => setActiveTab("market")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "market"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            模板市场
          </button>
        </nav>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {activeTab === "my" ? (
          <TemplateList onUseTemplate={handleUseTemplate} />
        ) : (
          <TemplateMarket />
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
