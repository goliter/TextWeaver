import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "个人主页",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      id: "run-pipeline",
      label: "流水线",
      path: "/dashboard/run-pipeline",
      icon: "⚙️",
    },
    {
      id: "template-library",
      label: "流水线模板库",
      path: "/dashboard/template-library",
      icon: "📚",
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
      <aside className="bg-white/80 backdrop-blur-md shadow-md w-64 shrink-0 fixed h-screen border-r border-indigo-100 z-20">
        <div className="h-16 border-b border-indigo-100 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 文本工作流
          </h1>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isActive(item.path)
                      ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-100">
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <div className="w-12 h-12 rounded-full bg-linear-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {user?.username}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-300 text-sm font-medium shrink-0"
            >
              退出
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 ml-64">
        <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 border-b border-indigo-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="text-lg font-medium text-gray-900">
            {navItems.find((item) => isActive(item.path))?.label ||
              "AI 文本工作流"}
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
