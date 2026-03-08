import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TemplateList from "@/components/template/TemplateList";
import ShareTemplateDialog from "@/components/template/ShareTemplateDialog";
import type { WorkflowTemplate } from "@/types/template";

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"my" | "market">("my");
  const [shareTemplate, setShareTemplate] = useState<WorkflowTemplate | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const handleUseTemplate = (flowId: number) => {
    navigate(`/dashboard/workflows/${flowId}`);
  };

  const handleShare = (template: WorkflowTemplate) => {
    setShareTemplate(template);
    setShowShareDialog(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 页面头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">模板管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            管理您的工作流模板，快速复用已构建的工作流
          </p>
        </div>
      </div>

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
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">模板市场</h3>
            <p className="text-gray-500 text-sm">
              浏览社区分享的模板（功能开发中...）
            </p>
          </div>
        )}
      </div>

      {/* 分享弹窗 */}
      <ShareTemplateDialog
        isOpen={showShareDialog}
        template={shareTemplate}
        onClose={() => {
          setShowShareDialog(false);
          setShareTemplate(null);
        }}
      />
    </div>
  );
};

export default TemplatesPage;
