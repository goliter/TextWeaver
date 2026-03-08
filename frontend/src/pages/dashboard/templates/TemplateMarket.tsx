import React, { useState, useEffect, useRef } from "react";
import { getTemplateMarket, addTemplateToMine } from "@/api/template";
import type { WorkflowTemplate } from "@/types/template";
import TemplateCard from "@/components/template/TemplateCard";

const TemplateMarket: React.FC = () => {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortBy, setSortBy] = useState<"use_count" | "created_at">("use_count");
  const [addingTemplates, setAddingTemplates] = useState<Set<number>>(
    new Set(),
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastTemplateRef = useRef<HTMLDivElement | null>(null);

  const loadTemplates = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      const currentPage = reset ? 1 : page;
      const response = await getTemplateMarket({
        keyword: searchKeyword || undefined,
        sort_by: sortBy,
        sort_order: "desc",
        page: currentPage,
        page_size: 20,
      });

      if (reset) {
        setTemplates(response.templates);
        setPage(2);
      } else {
        setTemplates((prev) => [...prev, ...response.templates]);
        setPage((prev) => prev + 1);
      }

      setHasMore(response.templates.length === 20);
    } catch (err: any) {
      setError(err.response?.data?.detail || "加载模板市场失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates(true);
  }, [searchKeyword, sortBy]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadTemplates();
      }
    });

    if (lastTemplateRef.current) {
      observer.current.observe(lastTemplateRef.current);
    }

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [templates, hasMore, loading]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadTemplates(true);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as "use_count" | "created_at");
  };

  const handleAddToMyTemplates = async (templateId: number) => {
    setAddingTemplates((prev) => new Set(prev).add(templateId));
    setError(null);

    try {
      await addTemplateToMine(templateId);
      setSuccessMessage("模板添加成功！");
      // 3秒后清除成功消息
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "添加模板失败");
    } finally {
      setAddingTemplates((prev) => {
        const newSet = new Set(prev);
        newSet.delete(templateId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* 搜索和排序 */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="搜索模板名称或描述..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            搜索
          </button>
        </form>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">排序：</label>
          <select
            value={sortBy}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          >
            <option value="use_count">使用次数</option>
            <option value="created_at">创建时间</option>
          </select>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700">
          {successMessage}
        </div>
      )}

      {/* 模板列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <div
            key={template.id}
            ref={index === templates.length - 1 ? lastTemplateRef : null}
          >
            <TemplateCard
              template={template}
              showAddToMyTemplates={true}
              onAddToMyTemplates={() => handleAddToMyTemplates(template.id)}
              isAdding={addingTemplates.has(template.id)}
            />
          </div>
        ))}
      </div>

      {/* 加载更多 */}
      {loading && (
        <div className="mt-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      )}

      {/* 没有更多数据 */}
      {!hasMore && templates.length > 0 && (
        <div className="mt-8 text-center text-gray-500">没有更多模板了</div>
      )}

      {/* 空状态 */}
      {!loading && templates.length === 0 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchKeyword ? "没有找到匹配的模板" : "模板市场为空"}
          </h3>
          <p className="text-gray-500">
            {searchKeyword
              ? "尝试使用其他关键词搜索"
              : "还没有用户分享模板，成为第一个分享者吧！"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TemplateMarket;
