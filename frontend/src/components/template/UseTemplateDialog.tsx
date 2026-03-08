import React, { useState } from "react";
import { usetemplate } from "@/api/template";
import type { WorkflowTemplate } from "@/types/template";

interface UseTemplateDialogProps {
  isOpen: boolean;
  template: WorkflowTemplate | null;
  onClose: () => void;
  onSuccess: (flowId: number) => void;
}

const UseTemplateDialog: React.FC<UseTemplateDialogProps> = ({
  isOpen,
  template,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 重置表单当模板改变时
  React.useEffect(() => {
    if (template) {
      setName(template.name + " 副本");
      setDescription(template.description || "");
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await usetemplate(template.id, {
        name,
        description: description || undefined,
      });

      onSuccess(response.flow_id);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "创建工作流失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw]">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">使用模板</h3>
        <p className="text-sm text-gray-500 mb-6">
          基于模板 "{template.name}" 创建新工作流
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              工作流名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入工作流名称"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="输入工作流描述（可选）"
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">模板信息：</span>
            </p>
            <ul className="mt-2 text-xs text-gray-500 space-y-1">
              <li>• 将被复制：节点配置、连接关系、文件系统</li>
              <li>• 新工作流将包含模板中的所有文件和文件夹</li>
              <li>• 您可以在创建后自由修改新工作流</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "创建中..." : "创建工作流"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UseTemplateDialog;
