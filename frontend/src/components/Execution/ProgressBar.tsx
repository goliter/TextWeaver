import React from "react";

interface ProgressBarProps {
  progress: number; // 0-100
  status?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, status }) => {
  const getProgressColor = () => {
    if (status === "running") return "bg-blue-500";
    if (status === "completed") return "bg-green-500";
    if (status === "failed") return "bg-red-500";
    return "bg-indigo-500";
  };

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>执行进度</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${getProgressColor()} transition-all duration-300`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;