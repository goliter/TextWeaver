import React from "react";
import { useAuthStore } from "../store/authStore";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      {/* 欢迎卡片 */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          欢迎回来，{user?.username}！
        </h2>
        <p className="text-indigo-100">
          开始使用AI文本工作流，提升您的创作效率
        </p>
      </div>

      {/* 功能卡片区域 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* 运行流水线卡片 */}
        <Link
          to="run-pipeline"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">⚙️</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                运行流水线
              </h3>
              <p className="text-gray-600">管理和执行您的AI文本工作流流水线</p>
            </div>
          </div>
        </Link>

        {/* 流水线模板库卡片 */}
        <Link
          to="template-library"
          className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-indigo-100"
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📚</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                流水线模板库
              </h3>
              <p className="text-gray-600">
                选择合适的模板，快速创建AI文本工作流
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* 统计信息卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
          <div className="text-3xl font-bold text-indigo-600 mb-2">0</div>
          <div className="text-gray-600">已创建流水线</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
          <div className="text-3xl font-bold text-purple-600 mb-2">0</div>
          <div className="text-gray-600">已运行次数</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
          <div className="text-3xl font-bold text-pink-600 mb-2">0</div>
          <div className="text-gray-600">已保存模板</div>
        </div>
      </div>

      {/* 最近活动卡片 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">最近活动</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="text-green-500">✅</div>
              <div>
                <div className="font-medium text-gray-900">您的账号已创建</div>
                <div className="text-sm text-gray-500">刚刚</div>
              </div>
            </div>
          </div>
          <div className="text-center text-gray-500 py-4">暂无更多活动记录</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
