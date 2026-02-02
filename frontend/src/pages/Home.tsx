import React from "react";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* 主内容区 */}
      <div className="max-w-4xl w-full text-center">
        {/* 网站名称 */}
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Textweave
        </h1>

        {/* 网站介绍 */}
        <div className="mb-8">
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            可视化、节点化、文件驱动的文本生成与处理系统
          </p>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            生成式文本工作流引擎
          </p>

          {/* 欢迎信息 */}
          <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
            欢迎使用 Textweave，体验智能文本生成与处理的全新方式
          </p>
        </div>

        {/* 按钮区域 */}
        <div className="flex flex-row justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-full bg-gray-800 text-white border border-gray-700 shadow-lg hover:shadow-xl hover:bg-gray-750 transition-all duration-300 font-semibold"
          >
            登录
          </Link>
          <Link
            to="/register"
            className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            注册
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
