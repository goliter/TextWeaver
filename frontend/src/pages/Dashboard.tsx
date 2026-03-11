import React from "react";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          个人主页
        </h1>
        <p className="text-gray-600">欢迎回来！管理您的AI文本工作流和配置</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 工作流卡片 */}
        <Link
          to="/dashboard/workflows"
          className="block p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100 hover:border-indigo-300 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-linear-to-br from-green-100 to-emerald-100 rounded-lg shadow-sm">
              <span className="text-2xl">⚙️</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">工作流</h2>
              <p className="text-gray-500 mt-1">管理 AI 文本处理工作流</p>
            </div>
          </div>
        </Link>

        {/* 模板管理卡片 */}
        <Link
          to="/dashboard/templates"
          className="block p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100 hover:border-indigo-300 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-linear-to-br from-purple-100 to-violet-100 rounded-lg shadow-sm">
              <span className="text-2xl">📋</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">模板管理</h2>
              <p className="text-gray-500 mt-1">管理工作流模板</p>
            </div>
          </div>
        </Link>

        {/* AI服务配置卡片 */}
        <Link
          to="/dashboard/ai-services"
          className="block p-6 bg-white/80 backdrop-blur-md rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-indigo-100 hover:border-indigo-300 hover:scale-105"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-linear-to-br from-blue-100 to-indigo-100 rounded-lg shadow-sm">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">
                AI服务配置
              </h2>
              <p className="text-gray-500 mt-1">配置 AI 服务参数</p>
            </div>
          </div>
        </Link>

      </div>

      <div className="bg-linear-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 shadow-lg text-white">
        <h2 className="text-2xl font-bold mb-4">AI 文本工作流平台</h2>
        <p className="mb-6">
          一个强大的平台，用于创建、管理和执行 AI
          驱动的文本处理工作流。通过可视化的节点编辑器，
          您可以轻松构建复杂的文本处理流程，利用先进的 AI
          模型来处理各种文本任务。
        </p>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/dashboard/workflows"
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            开始创建工作流
          </Link>
          <Link
            to="/dashboard/templates"
            className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium hover:bg-white/30 transition-colors"
          >
            浏览模板
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
