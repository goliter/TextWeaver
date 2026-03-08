import React, { useState } from "react";
import { createTemplate } from "@/api/template";

interface TemplateSaveDialogProps {
  isOpen: boolean;
  flowId: number;
  flowName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TemplateSaveDialog: React.FC<TemplateSaveDialogProps> = ({
  isOpen,
  flowId,
  flowName,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(flowName + " 模板");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createTemplate({
        name,
        description: description || undefined,
        tags: tagList.length > 0 ? tagList : undefined,
        source_flow_id: flowId,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || "保存模板失败");
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">保存为模板</h3>
        <p className="text-sm text-gray-500 mb-6">
          将当前工作流保存为模板，方便后续复用
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              模板名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="输入模板名称"
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
              placeholder="输入模板描述（可选）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              标签
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="用逗号分隔，如：数据分析,自动化"
            />
            <p className="mt-1 text-xs text-gray-500">
              多个标签请用逗号分隔
            </p>
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
              {loading ? "保存中..." : "保存模板"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TemplateSaveDialog;
