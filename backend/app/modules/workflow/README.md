# 工作流模块 (Workflow Module)

## 概述

工作流模块提供了完整的 AI 工作流管理功能，包括工作流的创建、编辑、执行和监控。用户可以通过可视化界面创建包含多种节点类型的工作流，实现复杂的 AI 文本处理流程。

## 数据结构

### 数据库表

#### 1. flows 表 - 工作流

| 字段 | 类型 | 描述 |
|-----|------|------|
| id | INTEGER | 主键，自增 |
| name | VARCHAR(255) | 工作流名称 |
| description | TEXT | 工作流描述 |
| user_id | INTEGER | 所属用户 ID，外键关联 users 表 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 2. nodes 表 - 节点

| 字段 | 类型 | 描述 |
|-----|------|------|
| id | INTEGER | 主键，自增 |
| flow_id | INTEGER | 所属工作流 ID，外键关联 flows 表 |
| node_type | VARCHAR(50) | 节点类型：input, output, ai, file_reader, file_writer |
| name | VARCHAR(255) | 节点名称 |
| position | JSONB | 节点位置：{"x": 100, "y": 200} |
| data | JSONB | 节点配置数据 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

#### 3. edges 表 - 边（连接）

| 字段 | 类型 | 描述 |
|-----|------|------|
| id | INTEGER | 主键，自增 |
| flow_id | INTEGER | 所属工作流 ID，外键关联 flows 表 |
| source_node_id | INTEGER | 源节点 ID，外键关联 nodes 表 |
| target_node_id | INTEGER | 目标节点 ID，外键关联 nodes 表 |
| source_handle | VARCHAR(50) | 源节点输出句柄 |
| target_handle | VARCHAR(50) | 目标节点输入句柄 |
| created_at | TIMESTAMP | 创建时间 |

#### 4. executions 表 - 执行记录

| 字段 | 类型 | 描述 |
|-----|------|------|
| id | INTEGER | 主键，自增 |
| flow_id | INTEGER | 工作流 ID，外键关联 flows 表 |
| user_id | INTEGER | 执行用户 ID，外键关联 users 表 |
| status | VARCHAR(20) | 执行状态：pending, running, success, error, cancelled |
| start_time | TIMESTAMP | 开始时间 |
| end_time | TIMESTAMP | 结束时间 |
| error_message | TEXT | 错误信息 |

#### 5. execution_logs 表 - 执行日志

| 字段 | 类型 | 描述 |
|-----|------|------|
| id | INTEGER | 主键，自增 |
| execution_id | INTEGER | 执行记录 ID，外键关联 executions 表 |
| node_id | INTEGER | 节点 ID，外键关联 nodes 表 |
| status | VARCHAR(20) | 节点执行状态：pending, running, success, error |
| input_data | JSONB | 输入数据 |
| output_data | JSONB | 输出数据 |
| error_message | TEXT | 错误信息 |
| start_time | TIMESTAMP | 开始时间 |
| end_time | TIMESTAMP | 结束时间 |

## API 接口

### 工作流管理

#### 1. 获取工作流列表

```
GET /api/workflows
```

**响应示例：**
```json
[
  {
    "id": 1,
    "name": "文本处理工作流",
    "description": "处理文本的 AI 工作流",
    "user_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": null
  }
]
```

#### 2. 获取工作流详情

```
GET /api/workflows/{flow_id}
```

**响应示例：**
```json
{
  "id": 1,
  "name": "文本处理工作流",
  "description": "处理文本的 AI 工作流",
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null,
  "nodes": [
    {
      "id": 1,
      "flow_id": 1,
      "node_type": "input",
      "name": "输入节点",
      "position": {"x": 100, "y": 100},
      "data": {},
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ],
  "edges": []
}
```

#### 3. 创建工作流

```
POST /api/workflows
```

**请求体：**
```json
{
  "name": "新工作流",
  "description": "工作流描述"
}
```

**响应示例：**
```json
{
  "id": 1,
  "name": "新工作流",
  "description": "工作流描述",
  "user_id": 1,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": null
}
```

#### 4. 更新工作流

```
PUT /api/workflows/{flow_id}
```

**请求体：**
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述"
}
```

#### 5. 删除工作流

```
DELETE /api/workflows/{flow_id}
```

#### 6. 复制工作流

```
POST /api/workflows/{flow_id}/duplicate
```

### 节点管理

#### 1. 获取工作流的所有节点

```
GET /api/workflows/{flow_id}/nodes
```

#### 2. 创建节点

```
POST /api/workflows/{flow_id}/nodes
```

**请求体：**
```json
{
  "node_type": "ai",
  "name": "AI 处理节点",
  "position": {"x": 200, "y": 100},
  "data": {
    "model": "gpt-3.5-turbo",
    "prompt": "处理以下文本：{input}"
  }
}
```

#### 3. 更新节点

```
PUT /api/workflows/{flow_id}/nodes/{node_id}
```

#### 4. 删除节点

```
DELETE /api/workflows/{flow_id}/nodes/{node_id}
```

### 边管理

#### 1. 获取工作流的所有边

```
GET /api/workflows/{flow_id}/edges
```

#### 2. 创建边

```
POST /api/workflows/{flow_id}/edges
```

**请求体：**
```json
{
  "source_node_id": 1,
  "target_node_id": 2,
  "source_handle": "output",
  "target_handle": "input"
}
```

#### 3. 删除边

```
DELETE /api/workflows/{flow_id}/edges/{edge_id}
```

### 执行管理

#### 1. 执行工作流

```
POST /api/workflows/{flow_id}/execute
```

**请求体：**
```json
{
  "inputs": {
    "input_node_id": "用户输入的文本内容"
  }
}
```

**响应示例：**
```json
{
  "execution_id": 1,
  "status": "pending",
  "start_time": "2024-01-01T00:00:00Z"
}
```

#### 2. 获取执行详情

```
GET /api/executions/{execution_id}
```

#### 3. 获取执行日志

```
GET /api/executions/{execution_id}/logs
```

#### 4. 取消执行

```
POST /api/executions/{execution_id}/cancel
```

#### 5. 获取工作流执行历史

```
GET /api/workflows/{flow_id}/executions
```

## 节点类型

### 1. 输入节点 (input)

用于接收用户输入的文本内容。

**数据结构：**
```json
{
  "node_type": "input",
  "name": "输入节点",
  "data": {
    "placeholder": "请输入文本..."
  }
}
```

### 2. 输出节点 (output)

用于输出处理后的文本内容。

**数据结构：**
```json
{
  "node_type": "output",
  "name": "输出节点",
  "data": {}
}
```

### 3. AI 节点 (ai)

用于调用 AI 模型处理文本。

**数据结构：**
```json
{
  "node_type": "ai",
  "name": "AI 处理节点",
  "data": {
    "model": "gpt-3.5-turbo",
    "prompt": "处理以下文本：{input}",
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

### 4. 文件读取节点 (file_reader)

用于读取文件系统中的文件内容。

**数据结构：**
```json
{
  "node_type": "file_reader",
  "name": "文件读取节点",
  "data": {
    "file_id": 1
  }
}
```

### 5. 文件写入节点 (file_writer)

用于将内容写入文件系统中的文件。

**数据结构：**
```json
{
  "node_type": "file_writer",
  "name": "文件写入节点",
  "data": {
    "file_id": 2,
    "overwrite": true
  }
}
```

## 执行状态

| 状态 | 描述 |
|-----|------|
| pending | 等待执行 |
| running | 正在执行 |
| success | 执行成功 |
| error | 执行失败 |
| cancelled | 已取消 |

## 使用示例

### 1. 创建一个简单的 AI 文本处理工作流

```python
# 1. 创建工作流
POST /api/workflows
{
  "name": "AI 文本处理",
  "description": "使用 AI 处理文本"
}

# 2. 创建输入节点
POST /api/workflows/1/nodes
{
  "node_type": "input",
  "name": "输入",
  "position": {"x": 100, "y": 100},
  "data": {}
}

# 3. 创建 AI 节点
POST /api/workflows/1/nodes
{
  "node_type": "ai",
  "name": "AI 处理",
  "position": {"x": 300, "y": 100},
  "data": {
    "model": "gpt-3.5-turbo",
    "prompt": "总结以下文本：{input}"
  }
}

# 4. 创建输出节点
POST /api/workflows/1/nodes
{
  "node_type": "output",
  "name": "输出",
  "position": {"x": 500, "y": 100},
  "data": {}
}

# 5. 连接节点
POST /api/workflows/1/edges
{
  "source_node_id": 1,
  "target_node_id": 2
}

POST /api/workflows/1/edges
{
  "source_node_id": 2,
  "target_node_id": 3
}

# 6. 执行工作流
POST /api/workflows/1/execute
{
  "inputs": {
    "1": "这是一段需要总结的文本内容..."
  }
}
```

## 注意事项

1. **权限验证**：所有操作都需要用户登录，且只能操作自己的工作流
2. **级联删除**：删除工作流时会自动删除所有相关的节点、边和执行记录
3. **执行引擎**：目前执行引擎部分尚未实现，执行操作仅创建执行记录
4. **异步执行**：未来将支持异步执行和实时状态更新

## 未来扩展

- 实现完整的执行引擎
- 支持更多 AI 模型
- 添加节点执行器插件系统
- 实现实时状态推送（WebSocket/SSE）
- 支持工作流模板
- 添加定时执行功能
- 支持并行执行