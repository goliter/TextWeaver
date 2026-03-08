import React, { useState } from "react";
import { shareTemplate, revokeShare } from "@/api/template";
import type { WorkflowTemplate, TemplateShareResponse } from "@/types/template";

interface ShareTemplateDialogProps {
  isOpen: boolean;
  template: WorkflowTemplate | null;
  onClose: () => void;
}

const ShareTemplateDialog: React.FC<ShareTemplateDialogProps> = ({
  isOpen,
  template,
  onClose,
}) => {
  const [permission, setPermission] = useState<"public" | "private">("private");
  const [expiresDays, setExpiresDays] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<TemplateShareResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !template) return null;

  const handleShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const expiresAt = expiresDays
        ? new Date(Date.now() + parseInt(expiresDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const result = await shareTemplate(template.id, {
        permission,
        expires_at: expiresAt,
      });

      setShareResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || "分享模板失败");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareResult?.share_url) {
      const fullUrl = `${window.location.origin}${shareResult.share_url}`;
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("确定要撤销此模板的所有分享吗？")) {
      return;
    }

    try {
      setLoading(true);
      await revokeShare(template.id);
      setShareResult(null);
      alert("分享已撤销");
    } catch (err: any) {
      setError(err.response?.data?.detail || "撤销分享失败");
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
        <h3 className="text-xl font-semibold text-gray-900 mb-2">分享模板</h3>
        <p className="text-sm text-gray-500 mb-6">
          分享 "{template.name}" 给其他用户
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        {!shareResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分享权限
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="private"
                    checked={permission === "private"}
                    onChange={(e) => setPermission(e.target.value as "private")}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">私有分享（需要链接）</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="public"
                    checked={permission === "public"}
                    onChange={(e) => setPermission(e.target.value as "public")}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">公开分享（所有人可见）</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                过期时间（可选）
              </label>
              <select
                value={expiresDays}
                onChange={(e) => setExpiresDays(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">永不过期</option>
                <option value="1">1天后过期</option>
                <option value="7">7天后过期</option>
                <option value="30">30天后过期</option>
                <option value="90">90天后过期</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                取消
              </button>
              <button
                onClick={handleShare}
                disabled={loading}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
              >
                {loading ? "生成中..." : "生成分享链接"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                分享链接已生成！
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}${shareResult.share_url}`}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm bg-white border border-green-300 rounded text-gray-700"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">分享信息：</p>
              <ul className="space-y-1 text-gray-500">
                <li>• 权限：{shareResult.permission === "public" ? "公开" : "私有"}</li>
                <li>• 访问次数：{shareResult.access_count}</li>
                {shareResult.expires_at && (
                  <li>
                    • 过期时间：{new Date(shareResult.expires_at).toLocaleString("zh-CN")}
                  </li>
                )}
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={handleRevoke}
                disabled={loading}
                className="px-4 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
              >
                撤销分享
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                完成
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareTemplateDialog;
