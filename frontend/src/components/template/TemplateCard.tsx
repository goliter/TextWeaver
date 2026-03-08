import React from "react";
import type { WorkflowTemplate } from "@/types/template";

interface TemplateCardProps {
  template: WorkflowTemplate;
  onClick?: () => void;
  onUse?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onUnshare?: () => void;
  onAddToMyTemplates?: () => void;
  showActions?: boolean;
  showAddToMyTemplates?: boolean;
  showShareButton?: boolean;
  isAdding?: boolean;
  isSharing?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onClick,
  onUse,
  onDelete,
  onShare,
  onUnshare,
  onAddToMyTemplates,
  showActions = true,
  showAddToMyTemplates = false,
  showShareButton = false,
  isAdding = false,
  isSharing = false,
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
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          使用 {template.use_count} 次
        </span>
      </div>

      {/* 创建时间 */}
      <p className="text-xs text-gray-400 mb-3">
        创建于 {formatDate(template.created_at)}
      </p>

      {/* 操作按钮 */}
      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {showAddToMyTemplates ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToMyTemplates?.();
              }}
              className="flex-1 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isAdding}
            >
              {isAdding ? "添加中..." : "添加到我的模板"}
            </button>
          ) : showShareButton ? (
            <>
              {template.is_public ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnshare?.();
                  }}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:bg-gray-200 disabled:cursor-not-allowed"
                  disabled={isSharing}
                >
                  {isSharing ? "处理中..." : "取消分享"}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare?.();
                  }}
                  className="flex-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={isSharing}
                >
                  {isSharing ? "处理中..." : "分享"}
                </button>
              )}
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
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TemplateCard;
