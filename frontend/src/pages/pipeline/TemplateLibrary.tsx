import React from "react";

const TemplateLibrary: React.FC = () => {
  // 模拟模板数据
  const templates = [
    {
      id: 1,
      name: "文案生成流水线",
      description: "快速生成广告文案、营销邮件和社交媒体帖子",
      category: "商业",
      icon: "💼",
    },
    {
      id: 2,
      name: "报告总结流水线",
      description: "从原始数据或文档自动生成结构化报告",
      category: "办公",
      icon: "📊",
    },
    {
      id: 3,
      name: "教育辅助流水线",
      description: "生成学习资料、试题和答案解析",
      category: "教育",
      icon: "📚",
    },
    {
      id: 4,
      name: "翻译转换流水线",
      description: "多语言翻译和文本风格转换",
      category: "语言",
      icon: "🌐",
    },
    {
      id: 5,
      name: "内容创作流水线",
      description: "辅助小说、故事和博客创作",
      category: "创作",
      icon: "✍️",
    },
    {
      id: 6,
      name: "数据分析流水线",
      description: "从数据中提取信息并生成可视化报告",
      category: "数据",
      icon: "📈",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-indigo-100">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            流水线模板库
          </h2>
          <p className="text-gray-600">
            选择合适的模板，快速创建您的AI文本工作流
          </p>
        </div>

        {/* 模板网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{template.icon}</div>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {template.category}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {template.name}
              </h3>
              <p className="text-gray-600 mb-4">{template.description}</p>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                使用模板
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
