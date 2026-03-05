import React, { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 4,
}) => {
  const [showPageSelector, setShowPageSelector] = useState(false);
  const [selectedPage, setSelectedPage] = useState(currentPage);

  // 生成页码数组
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    // 如果总页数较少，直接显示所有页码
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 总是显示第一页
    pages.push(1);

    // 计算中间显示的页码
    const halfVisible = Math.floor((maxVisiblePages - 2) / 2);
    let startPage = Math.max(2, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, currentPage + halfVisible);

    // 调整起始和结束页码，确保显示正确数量的页码
    const visibleMiddlePages = endPage - startPage + 1;
    const targetVisiblePages = maxVisiblePages - 2; // 减去第一页和最后一页

    if (visibleMiddlePages < targetVisiblePages) {
      // 需要添加更多页码
      const diff = targetVisiblePages - visibleMiddlePages;
      // 尝试向右扩展
      if (endPage < totalPages - 1) {
        endPage = Math.min(totalPages - 1, endPage + diff);
      }
      // 如果还不能满足，向左扩展
      if (endPage - startPage + 1 < targetVisiblePages && startPage > 2) {
        const remainingDiff = targetVisiblePages - (endPage - startPage + 1);
        startPage = Math.max(2, startPage - remainingDiff);
      }
    }

    // 添加省略号（如果需要）
    if (startPage > 2) {
      pages.push("...");
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // 添加省略号（如果需要）
    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    // 总是显示最后一页
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  // 处理页码点击
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && onPageChange) {
      onPageChange(page);
    }
  };

  // 处理页码选择
  const handlePageSelect = () => {
    handlePageClick(selectedPage);
    setShowPageSelector(false);
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setSelectedPage(Math.max(1, Math.min(totalPages, value)));
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center space-x-1">
      {/* 上一页按钮 */}
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;-
      </button>

      {/* 页码 */}
      {generatePageNumbers().map((page, index) => {
        if (page === "...") {
          return (
            <button
              key={`ellipsis-${index}`}
              onClick={() => setShowPageSelector(!showPageSelector)}
              className="px-2 py-1 text-xs border rounded-md hover:bg-gray-50 cursor-pointer"
            >
              {page}
            </button>
          );
        }

        return (
          <button
            key={page}
            onClick={() => handlePageClick(page as number)}
            className={`px-2 py-1 text-xs border rounded-md ${
              currentPage === page
                ? "bg-indigo-50 text-indigo-600"
                : "hover:bg-gray-50"
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* 页码选择器 */}
      {showPageSelector && (
        <div className="absolute z-10 bg-white p-2 border rounded-md shadow-md">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={selectedPage}
            onChange={handleInputChange}
            className="w-16 px-2 py-1 text-xs border rounded-md"
          />
          <button
            onClick={handlePageSelect}
            className="ml-2 px-2 py-1 text-xs bg-indigo-600 text-white rounded-md"
          >
            确定
          </button>
        </div>
      )}

      {/* 下一页按钮 */}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 text-xs border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        -&gt;
      </button>
    </div>
  );
};

export default Pagination;
