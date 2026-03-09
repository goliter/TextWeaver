# AI服务配置功能开发计划

## 功能概述

本功能旨在允许用户添加和管理个人的AI服务配置，包括API密钥、API基础URL和模型选择。用户可以添加多个模型配置，这些配置将保存到数据库中且只有创建者可以访问。在工作流的AI节点中，用户可以选择使用自己配置的模型。

## 技术架构

### 后端

1. **数据模型**
   - 创建 `AIService` 模型，存储用户的AI服务配置
   - 包含字段：id, user_id, name, api_key, api_base, model, is_default, created_at, updated_at

2. **API接口**
   - `GET /api/ai-services` - 获取当前用户的所有AI服务配置
   - `POST /api/ai-services` - 创建新的AI服务配置
   - `PUT /api/ai-services/{id}` - 更新AI服务配置
   - `DELETE /api/ai-services/{id}` - 删除AI服务配置
   - `PUT /api/ai-services/{id}/default` - 设置默认AI服务配置

3. **服务层**
   - `AIService` - 处理AI服务配置的业务逻辑
   - 集成到现有的AI服务调用中，优先使用用户配置的服务

### 前端

1. **页面组件**
   - `AIServiceConfigPage` - AI服务配置管理页面
   - `AIServiceForm` - AI服务配置表单组件
   - `AIServiceList` - AI服务配置列表组件

2. **集成**
   - 修改AI节点编辑器，添加模型选择下拉框，显示用户配置的模型
   - 在工作流执行时使用用户选择的AI服务配置

## 开发步骤

### 后端开发

1. 创建 `AIService` 数据模型
2. 实现 `AIService` 相关的CRUD操作
3. 开发API接口
4. 修改AI服务调用逻辑，支持用户配置的服务

### 前端开发

1. 创建AI服务配置管理页面
2. 实现AI服务配置的增删改查功能
3. 修改AI节点编辑器，集成模型选择功能
4. 测试整个功能流程

## 数据库设计

### `ai_services` 表

| 字段名 | 数据类型 | 约束 | 描述 |
|-------|---------|------|------|
| id | INTEGER | PRIMARY KEY | 服务ID |
| user_id | INTEGER | FOREIGN KEY | 用户ID |
| name | VARCHAR(255) | NOT NULL | 服务名称 |
| api_key | VARCHAR(255) | NOT NULL | API密钥 |
| api_base | VARCHAR(255) | NOT NULL | API基础URL |
| model | VARCHAR(255) | NOT NULL | 模型名称 |
| is_default | BOOLEAN | DEFAULT FALSE | 是否为默认服务 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | NULL | 更新时间 |

## 接口设计

### 获取AI服务配置列表

- **URL**: `/api/ai-services`
- **方法**: GET
- **响应**: 200 OK
```json
[
  {
    "id": 1,
    "user_id": 1,
    "name": "OpenAI",
    "api_key": "sk-...",
    "api_base": "https://api.openai.com/v1",
    "model": "gpt-3.5-turbo",
    "is_default": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### 创建AI服务配置

- **URL**: `/api/ai-services`
- **方法**: POST
- **请求体**:
```json
{
  "name": "OpenAI",
  "api_key": "sk-...",
  "api_base": "https://api.openai.com/v1",
  "model": "gpt-3.5-turbo",
  "is_default": false
}
```
- **响应**: 201 Created

### 更新AI服务配置

- **URL**: `/api/ai-services/{id}`
- **方法**: PUT
- **请求体**:
```json
{
  "name": "OpenAI Updated",
  "api_key": "sk-...",
  "api_base": "https://api.openai.com/v1",
  "model": "gpt-4",
  "is_default": true
}
```
- **响应**: 200 OK

### 删除AI服务配置

- **URL**: `/api/ai-services/{id}`
- **方法**: DELETE
- **响应**: 204 No Content

### 设置默认AI服务配置

- **URL**: `/api/ai-services/{id}/default`
- **方法**: PUT
- **响应**: 200 OK

## 前端设计

### AI服务配置管理页面

- **路径**: `/dashboard/ai-services`
- **功能**:
  - 显示用户的AI服务配置列表
  - 添加新的AI服务配置
  - 编辑现有AI服务配置
  - 删除AI服务配置
  - 设置默认AI服务配置

### AI节点编辑器集成

- 在AI节点编辑器中添加模型选择下拉框
- 下拉框中显示用户配置的所有模型
- 选择模型后，使用对应的API密钥和基础URL

## 实现注意事项

1. **安全性**
   - API密钥需要加密存储
   - 确保用户只能访问自己的AI服务配置

2. **兼容性**
   - 保持与现有AI服务调用的兼容性
   - 当用户未配置AI服务时，使用默认配置

3. **用户体验**
   - 提供清晰的错误提示
   - 简化配置流程，减少用户输入
   - 提供默认配置模板

## 测试计划

1. **功能测试**
   - 测试AI服务配置的增删改查功能
   - 测试默认服务设置功能
   - 测试AI节点中模型选择功能

2. **集成测试**
   - 测试工作流执行时使用用户配置的AI服务
   - 测试不同模型的调用效果

3. **安全测试**
   - 测试用户只能访问自己的AI服务配置
   - 测试API密钥的安全性

## 开发时间估计

- 后端开发: 2-3天
- 前端开发: 2-3天
- 测试和调试: 1-2天
- 总计: 5-8天
