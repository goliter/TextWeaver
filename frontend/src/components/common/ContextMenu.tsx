import React from "react";

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
  divider?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  title?: string;
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  items,
  title,
  onClose,
}) => {
  return (
    <>
      {/* 遮罩层，点击关闭菜单 */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      {/* 菜单 */}
      <div
        className="absolute z-50 bg-white rounded-lg shadow-lg py-2 min-w-[160px] border border-gray-200"
        style={{ left: x, top: y }}
      >
        {title && (
          <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-gray-100 mb-1">
            {title}
          </div>
        )}
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.divider && <div className="my-1 border-t border-gray-100" />}
            <button
              className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 hover:bg-gray-50 transition-colors ${
                item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
              }`}
              onClick={() => {
                item.onClick();
                onClose();
              }}
            >
              {item.icon && <span className="w-4 h-4">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>
    </>
  );
};
