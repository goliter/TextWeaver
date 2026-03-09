import React, { useState, useEffect } from "react";
import { aiServicesApi, type AIService } from "@/api/ai-services";

const AIServiceList: React.FC = () => {
  const [services, setServices] = useState<AIService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [editingService, setEditingService] = useState<AIService | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    api_key: "",
    api_base: "",
    model: "",
    is_default: false,
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await aiServicesApi.getAll();
      console.log("API响应:", response);
      // 确保数据是数组
      if (Array.isArray(response)) {
        setServices(response);
        setError(null);
      } else {
        console.error("API返回的数据不是数组:", response);
        setServices([]);
        setError("获取AI服务配置失败：数据格式错误");
      }
    } catch (err) {
      console.error("获取AI服务配置失败:", err);
      setError("获取AI服务配置失败");
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (service?: AIService) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        api_key: service.api_key,
        api_base: service.api_base,
        model: service.model,
        is_default: service.is_default,
      });
      setIsEditing(true);
    } else {
      setEditingService(null);
      setFormData({
        name: "",
        api_key: "",
        api_base: "",
        model: "",
        is_default: false,
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing && editingService) {
        await aiServicesApi.update(editingService.id, formData);
      } else {
        await aiServicesApi.create(formData);
      }
      handleClose();
      fetchServices();
    } catch (err) {
      setError("保存AI服务配置失败");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("确定要删除这个AI服务配置吗？")) {
      try {
        await aiServicesApi.delete(id);
        fetchServices();
      } catch (err) {
        setError("删除AI服务配置失败");
        console.error(err);
      }
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await aiServicesApi.setDefault(id);
      fetchServices();
    } catch (err) {
      setError("设置默认AI服务配置失败");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-6">加载中...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI服务配置管理</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <button
        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        onClick={() => handleOpen()}
      >
        添加AI服务配置
      </button>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                API基础URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                模型
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                默认
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {service.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.api_base}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {service.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <input
                    type="checkbox"
                    checked={service.is_default}
                    onChange={() => handleSetDefault(service.id)}
                    disabled={service.is_default}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="mr-2 px-3 py-1 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => handleOpen(service)}
                  >
                    编辑
                  </button>
                  <button
                    className="px-3 py-1 border border-red-300 rounded text-red-700 hover:bg-red-50 transition-colors"
                    onClick={() => handleDelete(service.id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
          />
          <div className="relative bg-white rounded-lg shadow-xl p-6 w-[500px] max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isEditing ? "编辑AI服务配置" : "添加AI服务配置"}
            </h3>

            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  服务名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API密钥
                </label>
                <input
                  type="password"
                  name="api_key"
                  value={formData.api_key}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API基础URL
                </label>
                <input
                  type="text"
                  name="api_base"
                  value={formData.api_base}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  模型名称
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  设为默认服务
                </label>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {isEditing ? "保存" : "添加"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIServiceList;
