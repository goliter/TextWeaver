import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { workflowApi } from "@/api/workflow";
import type { FlowResponse } from "@/types/workflow";
import WorkflowCard from "@/components/workflow/WorkflowCard";
import WorkflowDialog from "@/components/workflow/WorkflowDialog";
import DeleteConfirmationDialog from "@/components/workflow/DeleteConfirmationDialog";

const WorkflowList: React.FC = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<FlowResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<FlowResponse | null>(
    null,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<FlowResponse | null>(
    null,
  );

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workflowApi.getWorkflows();
      setWorkflows(data);
    } catch (err) {
      setError("加载工作流失败");
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    if (a.updated_at && b.updated_at) {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }
    if (a.updated_at) return -1;
    if (b.updated_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedWorkflows.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentWorkflows = sortedWorkflows.slice(startIndex, endIndex);

  const handleCreateWorkflow = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      await workflowApi.createWorkflow(data);
      await loadWorkflows();
      setIsDialogOpen(false);
    } catch (err) {
      console.error("Failed to create workflow:", err);
      throw err;
    }
  };

  const handleUpdateWorkflow = async (
    workflowId: number,
    data: { name: string; description?: string },
  ) => {
    try {
      await workflowApi.updateWorkflow(workflowId, data);
      await loadWorkflows();
      setIsDialogOpen(false);
      setEditingWorkflow(null);
    } catch (err) {
      console.error("Failed to update workflow:", err);
      throw err;
    }
  };

  const handleDeleteWorkflow = (workflow: FlowResponse) => {
    setWorkflowToDelete(workflow);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!workflowToDelete) return;

    try {
      await workflowApi.deleteWorkflow(workflowToDelete.id);
      await loadWorkflows();
      setIsDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    } catch (err) {
      console.error("Failed to delete workflow:", err);
      alert("删除工作流失败");
      setIsDeleteDialogOpen(false);
      setWorkflowToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setWorkflowToDelete(null);
  };

  const handleOpenWorkflow = (workflowId: number) => {
    navigate(`/dashboard/workflows/${workflowId}`);
  };

  const handleEdit = (workflow: FlowResponse) => {
    setEditingWorkflow(workflow);
    setIsDialogOpen(true);
  };

  const handleCreateNew = () => {
    setEditingWorkflow(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingWorkflow(null);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">工作流</h1>
        <button
          onClick={handleCreateNew}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          创建工作流
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="搜索工作流..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-500">加载中...</p>
        </div>
      ) : currentWorkflows.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无工作流</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "没有找到匹配的工作流"
              : "开始创建您的第一个工作流吧"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onOpen={() => handleOpenWorkflow(workflow.id)}
                onEdit={() => handleEdit(workflow)}
                onDelete={() => handleDeleteWorkflow(workflow)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                上一页
              </button>
              <span className="text-sm text-gray-600">
                第 {currentPage} / {totalPages} 页
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}

      <WorkflowDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onSubmit={
          editingWorkflow
            ? (data) => handleUpdateWorkflow(editingWorkflow.id, data)
            : handleCreateWorkflow
        }
        initialData={
          editingWorkflow
            ? {
                name: editingWorkflow.name,
                description: editingWorkflow.description,
              }
            : undefined
        }
        title={editingWorkflow ? "编辑工作流" : "创建工作流"}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        workflowName={workflowToDelete?.name || ""}
      />
    </div>
  );
};

export default WorkflowList;
