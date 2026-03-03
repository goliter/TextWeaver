import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const WorkflowDetail: React.FC = () => {
  const { workflowId } = useParams<{ workflowId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/dashboard/workflows");
  };

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
      </header>

      {/* 主要内容 */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            工作流 ID: {workflowId}
          </h2>
          <p className="text-gray-600 mb-6">工作流详情页面（待实现）</p>

          <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <h3 className="font-medium text-indigo-900 mb-2">开发计划</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>工作流可视化编辑界面</li>
              <li>节点添加和配置功能</li>
              <li>工作流执行和监控</li>
              <li>与文件系统集成</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WorkflowDetail;
