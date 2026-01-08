import React from "react";

const RunPipeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            流水线运行中心
          </h2>
          <p className="text-gray-600">管理和执行您的AI文本工作流流水线</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 流水线运行区域 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              创建与执行
            </h3>
            <p className="text-gray-600 mb-4">
              选择或创建流水线，配置参数后执行。实时查看运行状态和结果。
            </p>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                新建流水线
              </button>
              <button className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors font-medium">
                选择模板
              </button>
            </div>
          </div>

          {/* 最近运行记录 */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              最近运行记录
            </h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">测试流水线</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    成功
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  2026-01-08 15:00
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    文案生成流水线
                  </span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    失败
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  2026-01-08 14:30
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 流水线列表 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">我的流水线</h3>
        <div className="text-center text-gray-500 py-8">
          暂无流水线，请创建新流水线或从模板导入
        </div>
      </div>
    </div>
  );
};

export default RunPipeline;
