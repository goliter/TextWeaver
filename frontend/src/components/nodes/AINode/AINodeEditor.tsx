import React, { useState, useEffect } from "react";
import PromptEditor from "./PromptEditor";
import DataSourceManager from "./DataSourceManager";
import { aiServicesApi, type AIService } from "../../../api/ai-services";

interface AINodeEditorProps {
  isOpen: boolean;
  node: any;
  edges?: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

const AINodeEditor: React.FC<AINodeEditorProps> = ({
  isOpen,
  node,
  edges = [],
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [aiServices, setAiServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node?.data) {
      setFormData(node.data);
    }
  }, [node]);

  useEffect(() => {
    const fetchAIServices = async () => {
      if (isOpen) {
        try {
          setLoading(true);
          const data = await aiServicesApi.getAll();
          // 确保数据是数组
          if (Array.isArray(data)) {
            setAiServices(data);
          } else {
            console.error("API返回的数据不是数组:", data);
            setAiServices([]);
          }
        } catch (error) {
          console.error("获取AI服务配置失败:", error);
          setAiServices([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAIServices();
  }, [isOpen]);

  if (!isOpen || !node) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const analyzeDataSources = () => {
    const topInputs: any[] = [];
    const leftInputs: any[] = [];

    edges.forEach((edge: any) => {
      if (edge.target === node.id) {
        if (edge.targetHandle === "top") {
          topInputs.push({
            id: `input_${edge.source}`,
            name: `input_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "input" as const,
          });
        } else if (edge.targetHandle === "left") {
          leftInputs.push({
            id: `file_${edge.source}`,
            name: `file_${edge.source}`,
            sourceNodeId: edge.source,
            sourceNodeName: `节点 ${edge.source}`,
            type: "file" as const,
          });
        }
      }
    });

    return { topInputs, leftInputs };
  };

  const { topInputs, leftInputs } = analyzeDataSources();

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          编辑 AI 节点
        </h3>
        <p className="text-sm text-gray-500 mb-6">编辑节点的详细配置</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              节点名称
            </label>
            <input
              type="text"
              value={formData.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AI服务配置
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50">
                加载中...
              </div>
            ) : (
              <select
                value={formData.ai_service_id || ""}
                onChange={(e) =>
                  handleChange(
                    "ai_service_id",
                    parseInt(e.target.value) || null,
                  )
                }
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">使用系统默认服务 (gemini-2.0-flash)</option>
                {aiServices.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.model})
                    {service.is_default && " (默认)"}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="use_ai"
                checked={formData.use_ai !== false} // 默认勾选
                onChange={(e) => handleChange("use_ai", e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="use_ai"
                className="ml-2 block text-sm text-gray-700"
              >
                使用 AI 处理
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              取消勾选后，该节点的输出将直接使用提示词内容，不调用 AI 服务
            </p>
          </div>
          <DataSourceManager topInputs={topInputs} leftInputs={leftInputs} />
          <PromptEditor
            value={formData.prompt || ""}
            onChange={(value) => handleChange("prompt", value)}
            variables={[...topInputs, ...leftInputs]}
          />
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default AINodeEditor;
