import React, { useState, useEffect } from "react";
import {
  getTemplates,
  deleteTemplate,
  shareTemplate,
  unshareTemplate,
} from "@/api/template";
import TemplateCard from "./TemplateCard";
import UseTemplateDialog from "./UseTemplateDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { WorkflowTemplate } from "@/types/template";

interface TemplateListProps {
  onUseTemplate?: (flowId: number) => void;
  onRefresh?: () => void;
}

const TemplateList: React.FC<TemplateListProps> = ({
  onUseTemplate,
  onRefresh,
}) => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<WorkflowTemplate | null>(null);
  const [showUseDialog, setShowUseDialog] = useState(false);
  const [sharingTemplates, setSharingTemplates] = useState<Set<number>>(
    new Set(),
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnshareDialog, setShowUnshareDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);
  const [templateToUnshare, setTemplateToUnshare] = useState<number | null>(
    null,
  );

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTemplates(false);
      setTemplates(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载模板列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleDelete = (templateId: number) => {
    setTemplateToDelete(templateId);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate(templateToDelete);
      loadTemplates();
      onRefresh?.();
    } catch (err: any) {
      alert(err.response?.data?.detail || "删除模板失败");
    } finally {
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const handleUse = (template: WorkflowTemplate) => {
    setSelectedTemplate(template);
    setShowUseDialog(true);
  };

  const handleUseSuccess = (flowId: number) => {
    onUseTemplate?.(flowId);
    loadTemplates();
  };

  const handleShare = async (templateId: number) => {
    setSharingTemplates((prev) => new Set(prev).add(templateId));
    try {
      await shareTemplate(templateId);
      loadTemplates();
    } catch (err: any) {
      alert(err.response?.data?.detail || "分享模板失败");
    } finally {
      setSharingTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  const handleUnshare = (templateId: number) => {
    setTemplateToUnshare(templateId);
    setShowUnshareDialog(true);
  };

  const confirmUnshare = async () => {
    if (!templateToUnshare) return;

    setSharingTemplates((prev) => new Set(prev).add(templateToUnshare));
    try {
      await unshareTemplate(templateToUnshare);
      loadTemplates();
    } catch (err: any) {
      alert(err.response?.data?.detail || "取消分享失败");
    } finally {
      setSharingTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateToUnshare);
        return newSet;
      });
      setShowUnshareDialog(false);
      setTemplateToUnshare(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">加载失败</div>
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={loadTemplates}
          className="mt-4 px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          重试
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">暂无模板</h3>
        <p className="text-gray-500 text-sm">
          您还没有保存任何模板，可以在工作流详情页保存为模板
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={() => handleUse(template)}
            onUse={() => handleUse(template)}
            onDelete={() => handleDelete(template.id)}
            onShare={() => handleShare(template.id)}
            onUnshare={() => handleUnshare(template.id)}
            showActions={true}
            showShareButton={true}
            isSharing={sharingTemplates.has(template.id)}
          />
        ))}
      </div>

      <UseTemplateDialog
        isOpen={showUseDialog}
        template={selectedTemplate}
        onClose={() => {
          setShowUseDialog(false);
          setSelectedTemplate(null);
        }}
        onSuccess={handleUseSuccess}
      />

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="确认删除"
        message="确定要删除这个模板吗？此操作不可撤销。"
        confirmText="删除"
        cancelText="取消"
        danger
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setTemplateToDelete(null);
        }}
      />

      <ConfirmDialog
        isOpen={showUnshareDialog}
        title="确认取消分享"
        message="确定要取消分享这个模板吗？它将不再出现在模板市场中。"
        confirmText="取消分享"
        cancelText="取消"
        onConfirm={confirmUnshare}
        onCancel={() => {
          setShowUnshareDialog(false);
          setTemplateToUnshare(null);
        }}
      />
    </>
  );
};

export default TemplateList;
