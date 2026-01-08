import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI 文本工作流
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-full bg-white text-indigo-600 border border-indigo-200 shadow-sm hover:shadow-md hover:bg-indigo-50 transition-all duration-300 font-medium"
              >
                登录
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
              >
                注册
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            智能文本工作流，让创作更高效
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            可视化构建AI工作流，轻松处理文本生成、改写、翻译、摘要等任务，提升您的创作效率
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              免费开始使用
            </Link>
            <Link
              to="#features"
              className="px-8 py-4 rounded-full bg-white text-indigo-600 text-lg font-semibold border border-indigo-200 shadow-md hover:shadow-lg transition-all duration-300"
            >
              了解功能
            </Link>
          </div>
        </div>

        {/* 核心功能 */}
        <section id="features" className="mb-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            核心功能
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 功能卡片 1 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                智能文本生成
              </h4>
              <p className="text-gray-600">
                利用AI模型生成各种类型的文本，包括文案、报告、故事等，支持自定义Prompt
              </p>
            </div>

            {/* 功能卡片 2 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔗</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                可视化工作流
              </h4>
              <p className="text-gray-600">
                拖拽式创建AI工作流，节点间可视化连接，直观管理文本处理流程
              </p>
            </div>

            {/* 功能卡片 3 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📁</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                文件管理
              </h4>
              <p className="text-gray-600">
                创建、编辑、管理Markdown文件，支持文件内容读取和写入，方便文本管理
              </p>
            </div>

            {/* 功能卡片 4 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                高效执行
              </h4>
              <p className="text-gray-600">
                一键执行工作流，实时显示执行状态，快速获得AI处理结果
              </p>
            </div>

            {/* 功能卡片 5 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">🔄</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                灵活配置
              </h4>
              <p className="text-gray-600">
                支持自定义AI模型参数，包括温度、最大令牌数等，灵活调整生成结果
              </p>
            </div>

            {/* 功能卡片 6 */}
            <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-2xl">📊</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">
                多场景应用
              </h4>
              <p className="text-gray-600">
                适用于文案创作、报告生成、教育辅助、客服问答等多种场景
              </p>
            </div>
          </div>
        </section>

        {/* 应用场景 */}
        <section className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            应用场景
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">💼</span>
                商业文案
              </h4>
              <p className="text-gray-600">
                快速生成广告文案、营销邮件、社交媒体帖子等，提升营销效果
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📚</span>
                教育辅助
              </h4>
              <p className="text-gray-600">
                自动生成学习资料、试题、答案解析，辅助教学工作
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📝</span>
                内容创作
              </h4>
              <p className="text-gray-600">
                辅助小说、故事、博客等内容创作，克服写作瓶颈
              </p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
              <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                数据分析
              </h4>
              <p className="text-gray-600">
                从数据中生成结构化报告，快速获取数据分析结果
              </p>
            </div>
          </div>
        </section>

        {/* 行动号召 */}
        <section className="text-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-4">开始您的智能文本创作之旅</h3>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            注册账号，立即体验AI文本工作流的强大功能，提升您的创作效率
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-4 rounded-full bg-white text-indigo-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
            >
              免费注册
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 rounded-full bg-transparent text-white border-2 border-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
            >
              已有账号？登录
            </Link>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-white/80 backdrop-blur-md shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-gray-500 text-sm">
            <p>AI 文本工作流 © 2026 | 让创作更高效</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
