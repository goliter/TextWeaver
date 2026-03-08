import React from "react";
import type { WorkflowTemplate } from "@/types/template";

interface TemplateCardProps {
  template: WorkflowTemplate;
  onClick?: () => void;
  onUse?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  onUse,
  onDelete,
  showActions = true,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* 头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 truncate">
            {template.name}
          </h4>
          {template.is_public && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
              公开
            </span>
          )}
        </div>
      </div>

      {/* 描述 */}
      {template.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* 标签 */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {template.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* 统计信息 */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          使用 {template.use_count} 次
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          分享 {template.share_count} 次
        </span>
      </div>

      {/* 创建时间 */}
      <p className="text-xs text-gray-400 mb-3">
        创建于 {formatDate(template.created_at)}
      </p>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUse?.();
            }}
            className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
          >
            使用模板
          </button>
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="px-3 py-1.5 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
            >
              删除
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
