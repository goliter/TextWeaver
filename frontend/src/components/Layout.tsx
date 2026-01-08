import React from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Layout: React.FC = () => {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
  }

  // 导航菜单数据
  const navItems = [
    {
      id: 'dashboard',
      label: '个人主页',
      path: '/dashboard',
      icon: '🏠'
    },
    {
      id: 'run-pipeline',
      label: '运行流水线',
      path: '/dashboard/run-pipeline',
      icon: '⚙️'
    },
    {
      id: 'template-library',
      label: '流水线模板库',
      path: '/dashboard/template-library',
      icon: '📚'
    }
  ]

  // 判断当前导航项是否激活
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex">
      {/* 左侧导航栏 */}
      <aside className="bg-white/80 backdrop-blur-md shadow-md w-64 flex-shrink-0 fixed h-screen border-r border-indigo-100 z-20">
        {/* 顶部Logo */}
        <div className="h-16 border-b border-indigo-100 flex items-center justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            AI 文本工作流
          </h1>
        </div>

        {/* 导航菜单 */}
        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* 用户信息 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-100">
          <div className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="font-medium text-gray-900">{user?.username}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-red-600 transition-colors"
              title="退出登录"
            >
              🚪
            </button>
          </div>
        </div>
      </aside>

      {/* 右侧内容区 */}
      <div className="flex-1 ml-64">
        {/* 顶部导航栏 */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm h-16 border-b border-indigo-100 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="text-lg font-medium text-gray-900">
            {/* 显示当前页面标题 */}
            {navItems.find(item => isActive(item.path))?.label || 'AI 文本工作流'}
          </div>
          <div className="flex items-center space-x-4">
            {/* 搜索框 */}
            <div className="relative">
              <input
                type="text"
                placeholder="搜索..."
                className="pl-10 pr-4 py-2 rounded-full border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            {/* 通知图标 */}
            <button className="relative text-gray-600 hover:text-indigo-600 transition-colors">
              🔔
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
          </div>
        </header>

        {/* 主内容区 */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout