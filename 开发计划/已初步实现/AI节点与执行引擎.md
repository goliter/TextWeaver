# AI 节点与执行引擎开发计划

## 一、功能概述

### 1.1 核心目标
构建一个强大的 AI 工作流执行引擎，支持用户创建包含 AI 节点的工作流，实现节点间的数据流转和智能处理。

### 1.2 设计方案
采用**执行引擎 + 节点插件**的架构：
- 核心：通用执行引擎，负责拓扑排序和节点执行
- 插件：各种 AI 节点实现，如 OpenAI、文件读写、输入输出等
- 状态：实时执行状态管理和前端更新

---

## 二、系统架构

### 2.1 整体架构图

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              前端 (React + Vite)                            │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌─────────────────────────────────────────────────────┐ │
│  │              │  │                                                     │ │
│  │  文件系统     │  │              React Flow 画布                         │ │
│  │  (侧边栏)     │  │                                                     │ │
│  │              │  │   ┌─────────┐     ┌─────────┐     ┌─────────┐       │ │
│  │  📁 文件夹    │  │   │📄 输入   │────▶│🤖 AI   │────▶│📝 输出   │       │ │
│  │    📄 文件    │  │   │ 节点    │     │ 节点    │     │ 节点    │       │ │
│  │              │  │   └─────────┘     └─────────┘     └─────────┘       │ │
│  │              │  │                                                     │ │
│  └──────────────┘  └─────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        右侧 Inspector                                │   │
│  │  (节点配置 / 执行状态)                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                              后端 (FastAPI)                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  执行引擎   │  │  AI 服务    │  │  工作流 API  │  │  状态管理   │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
├────────────────────────────────────────────────────────────────────────────┤
│                              数据库 (PostgreSQL)                            │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  flows 表   │  │  nodes 表   │  │ executions  │  │  logs 表    │       │
│  │             │  │             │  │    表       │  │             │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
│                                                                             │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层级 | 技术 | 用途 |
|-----|------|-----|
| 前端框架 | React 18 + TypeScript | UI 构建 |
| 状态管理 | Zustand | 全局状态 |
| 工作流画布 | React Flow | 节点可视化和拖拽 |
| 后端框架 | FastAPI | REST API |
| ORM | SQLAlchemy | 数据库操作 |
| 数据库 | PostgreSQL | 数据存储 |
| AI 集成 | OpenAI SDK | GPT 模型调用 |
| 实时通信 | WebSocket / SSE | 执行状态推送 |
| 队列 | Celery (可选) | 异步任务处理 |

---

## 三、数据库设计

### 3.1 核心表结构

#### 3.1.1 flows 表

```sql
CREATE TABLE flows (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_flows_user_id (user_id)
);
```

#### 3.1.2 nodes 表

```sql
CREATE TABLE nodes (
    id SERIAL PRIMARY KEY,
    flow_id INTEGER NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    node_type VARCHAR(50) NOT NULL,  -- input, output, ai, file_reader, file_writer
    name VARCHAR(255) NOT NULL,
    position JSONB NOT NULL,  -- {"x": 100, "y": 200}
    data JSONB NOT NULL,      -- 节点配置数据
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_nodes_flow_id (flow_id),
    INDEX idx_nodes_node_type (node_type)
);
```

#### 3.1.3 edges 表

```sql
CREATE TABLE edges (
    id SERIAL PRIMARY KEY,
    flow_id INTEGER NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
    source_node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    source_handle VARCHAR(50),
    target_handle VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_edges_flow_id (flow_id),
    INDEX idx_edges_source_node_id (source_node_id),
    INDEX idx_edges_target_node_id (target_node_id)
);
```

#### 3.1.4 executions 表

```sql
CREATE TABLE executions (
    id SERIAL PRIMARY KEY,
    flow_id INTEGER NOT NULL REFERENCES flows(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL,  -- pending, running, success, error
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    
    INDEX idx_executions_flow_id (flow_id),
    INDEX idx_executions_user_id (user_id),
    INDEX idx_executions_status (status)
);
```

#### 3.1.5 execution_logs 表

```sql
CREATE TABLE execution_logs (
    id SERIAL PRIMARY KEY,
    execution_id INTEGER NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    node_id INTEGER NOT NULL REFERENCES nodes(id),
    status VARCHAR(20) NOT NULL,  -- pending, running, success, error
    input_data JSONB,
    output_data JSONB,
    error_message TEXT,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_execution_logs_execution_id (execution_id),
    INDEX idx_execution_logs_node_id (node_id),
    INDEX idx_execution_logs_status (status)
);
```

### 3.2 SQLAlchemy 模型

```python
# app/modules/workflow/models.py
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Flow(Base):
    __tablename__ = "flows"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    nodes = relationship("Node", back_populates="flow", cascade="all, delete-orphan")
    edges = relationship("Edge", back_populates="flow", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="flow")

class Node(Base):
    __tablename__ = "nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    node_type = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    position = Column(JSON, nullable=False)
    data = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # 关系
    flow = relationship("Flow", back_populates="nodes")
    execution_logs = relationship("ExecutionLog", back_populates="node")

class Edge(Base):
    __tablename__ = "edges"
    
    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    source_node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    source_handle = Column(String(50), nullable=True)
    target_handle = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 关系
    flow = relationship("Flow", back_populates="edges")

class Execution(Base):
    __tablename__ = "executions"
    
    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)
    
    # 关系
    flow = relationship("Flow", back_populates="executions")
    logs = relationship("ExecutionLog", back_populates="execution", cascade="all, delete-orphan")

class ExecutionLog(Base):
    __tablename__ = "execution_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("executions.id"), nullable=False)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    status = Column(String(20), nullable=False)
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    # 关系
    execution = relationship("Execution", back_populates="logs")
    node = relationship("Node", back_populates="execution_logs")
```

---

## 四、后端 API 设计

### 4.1 工作流管理接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| GET | `/api/workflows` | 获取用户的工作流列表 |
| GET | `/api/workflows/{flow_id}` | 获取单个工作流详情（包含节点和边） |
| POST | `/api/workflows` | 创建新工作流 |
| PUT | `/api/workflows/{flow_id}` | 更新工作流信息 |
| DELETE | `/api/workflows/{flow_id}` | 删除工作流 |
| POST | `/api/workflows/{flow_id}/duplicate` | 复制工作流 |

### 4.2 节点管理接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | `/api/workflows/{flow_id}/nodes` | 创建节点 |
| PUT | `/api/workflows/{flow_id}/nodes/{node_id}` | 更新节点 |
| DELETE | `/api/workflows/{flow_id}/nodes/{node_id}` | 删除节点 |

### 4.3 边管理接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | `/api/workflows/{flow_id}/edges` | 创建边 |
| DELETE | `/api/workflows/{flow_id}/edges/{edge_id}` | 删除边 |

### 4.4 执行接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | `/api/workflows/{flow_id}/execute` | 执行工作流 |
| GET | `/api/executions/{execution_id}` | 获取执行详情 |
| GET | `/api/executions/{execution_id}/logs` | 获取执行日志 |
| POST | `/api/executions/{execution_id}/cancel` | 取消执行 |

### 4.5 AI 服务接口

| 方法 | 路径 | 描述 |
|-----|------|-----|
| POST | `/api/ai/chat` | 调用 AI 聊天接口 |
| POST | `/api/ai/completion` | 调用 AI 文本完成接口 |
| GET | `/api/ai/models` | 获取可用的 AI 模型 |

### 4.6 API 详细设计

#### 4.6.1 执行工作流

```
POST /api/workflows/{flow_id}/execute

Request:
{
  "inputs": {
    "input_node_id": "用户输入内容"
  }
}

Response:
{
  "execution_id": 1,
  "status": "pending",
  "start_time": "2024-01-01T00:00:00Z"
}
```

#### 4.6.2 获取执行状态

```
GET /api/executions/{execution_id}

Response:
{
  "id": 1,
  "flow_id": 1,
  "status": "running",
  "start_time": "2024-01-01T00:00:00Z",
  "current_node": "ai_node_1",
  "progress": 0.5
}
```

---

## 五、前端组件设计

### 5.1 组件结构

```
src/
├── components/
│   ├── FlowCanvas/             # 工作流画布组件
│   │   ├── index.tsx           # 主组件
│   │   ├── nodes/              # 自定义节点
│   │   │   ├── InputNode.tsx   # 输入节点
│   │   │   ├── OutputNode.tsx  # 输出节点
│   │   │   ├── AINode.tsx      # AI 节点
│   │   │   ├── FileReaderNode.tsx
│   │   │   └── FileWriterNode.tsx
│   │   └── controls/           # 画布控件
│   │       ├── MiniMap.tsx
│   │       ├── Controls.tsx
│   │       └── Background.tsx
│   │
│   ├── Inspector/              # 右侧属性面板
│   │   ├── index.tsx           # 主组件
│   │   ├── NodeConfig.tsx      # 节点配置
│   │   ├── FlowConfig.tsx      # 工作流配置
│   │   └── ExecutionStatus.tsx # 执行状态
│   │
│   └── Execution/              # 执行相关组件
│       ├── ExecutionHistory.tsx
│       ├── ExecutionLog.tsx
│       └── ProgressBar.tsx
│
├── pages/
│   ├── WorkflowEditor.tsx      # 工作流编辑器
│   └── WorkflowList.tsx        # 工作流列表
│
├── store/
│   ├── workflowStore.ts        # 工作流状态
│   ├── executionStore.ts       # 执行状态
│   └── aiStore.ts              # AI 服务状态
│
└── types/
    ├── workflow.ts             # 工作流类型
    ├── execution.ts            # 执行类型
    └── ai.ts                   # AI 类型
```

### 5.2 核心组件设计

#### 5.2.1 FlowCanvas 组件

```
功能：
- 显示工作流画布
- 支持节点拖拽和连接
- 支持缩放和移动
- 支持节点选择
- 显示执行状态

Props：
- flowId: number
- nodes: Node[]
- edges: Edge[]
- onNodesChange: (nodes: Node[]) => void
- onEdgesChange: (edges: Edge[]) => void
- onNodeSelect: (nodeId: string) => void
```

#### 5.2.2 AINode 组件

```
功能：
- 显示 AI 节点配置
- 支持模型选择
- 支持 Prompt 编辑
- 支持参数配置
- 显示执行状态

Props：
- data: AINodeData
- isSelected: boolean
- onDataChange: (data: AINodeData) => void
- executionStatus: ExecutionStatus
```

#### 5.2.3 ExecutionStatus 组件

```
功能：
- 显示执行进度
- 显示节点执行状态
- 显示执行日志
- 支持取消执行

Props：
- executionId: number
- execution: Execution
- logs: ExecutionLog[]
- onCancel: () => void
```

---

## 六、状态管理设计

### 6.1 workflowStore

```typescript
interface WorkflowStore {
  // 状态
  workflows: Workflow[];
  currentWorkflow: Workflow | null;
  nodes: Node[];
  edges: Edge[];
  loading: boolean;
  error: string | null;

  // 操作
  fetchWorkflows: () => Promise<void>;
  fetchWorkflow: (id: number) => Promise<void>;
  createWorkflow: (data: CreateWorkflowDto) => Promise<Workflow>;
  updateWorkflow: (id: number, data: UpdateWorkflowDto) => Promise<Workflow>;
  deleteWorkflow: (id: number) => Promise<void>;
  duplicateWorkflow: (id: number) => Promise<Workflow>;
  
  // 节点操作
  addNode: (node: Node) => Promise<Node>;
  updateNode: (id: number, data: NodeData) => Promise<Node>;
  deleteNode: (id: number) => Promise<void>;
  
  // 边操作
  addEdge: (edge: Edge) => Promise<Edge>;
  deleteEdge: (id: number) => Promise<void>;
}
```

### 6.2 executionStore

```typescript
interface ExecutionStore {
  // 状态
  executions: Execution[];
  currentExecution: Execution | null;
  logs: ExecutionLog[];
  loading: boolean;
  error: string | null;

  // 操作
  executeWorkflow: (flowId: number, inputs: Record<string, any>) => Promise<Execution>;
  fetchExecution: (id: number) => Promise<void>;
  fetchExecutionLogs: (executionId: number) => Promise<void>;
  cancelExecution: (id: number) => Promise<void>;
  fetchExecutionHistory: (flowId: number) => Promise<void>;
}
```

### 6.3 aiStore

```typescript
interface AIStore {
  // 状态
  models: AIModel[];
  loading: boolean;
  error: string | null;

  // 操作
  fetchModels: () => Promise<void>;
  chat: (messages: ChatMessage[]) => Promise<ChatResponse>;
  completion: (prompt: string, model: string) => Promise<CompletionResponse>;
}
```

---

## 七、执行引擎设计

### 7.1 核心流程

```
1. 接收执行请求
   └─▶ 验证工作流结构

2. 拓扑排序
   └─▶ 构建有向无环图
   └─▶ 计算执行顺序

3. 执行准备
   └─▶ 创建执行记录
   └─▶ 初始化节点状态

4. 顺序执行节点
   └─▶ 执行输入节点
   └─▶ 执行 AI 节点
   └─▶ 执行文件读写节点
   └─▶ 执行输出节点

5. 状态管理
   └─▶ 实时更新执行状态
   └─▶ 记录执行日志
   └─▶ 处理错误和异常

6. 执行完成
   └─▶ 更新执行状态
   └─▶ 通知前端
```

### 7.2 节点执行器

```python
# 基类执行器
class NodeExecutor:
    def execute(self, node: Node, context: dict) -> dict:
        raise NotImplementedError

# AI 节点执行器
class AINodeExecutor(NodeExecutor):
    def execute(self, node: Node, context: dict) -> dict:
        # 1. 解析 Prompt 模板
        # 2. 调用 AI 服务
        # 3. 处理响应
        # 4. 返回结果
        pass

# 文件读取节点执行器
class FileReaderNodeExecutor(NodeExecutor):
    def execute(self, node: Node, context: dict) -> dict:
        # 1. 读取文件内容
        # 2. 处理文件内容
        # 3. 返回结果
        pass

# 文件写入节点执行器
class FileWriterNodeExecutor(NodeExecutor):
    def execute(self, node: Node, context: dict) -> dict:
        # 1. 获取输入数据
        # 2. 写入文件
        # 3. 返回结果
        pass
```

### 7.3 Prompt 模板引擎

```python
class PromptTemplateEngine:
    def render(self, template: str, context: dict) -> str:
        """渲染 Prompt 模板
        
        支持的占位符:
        - {input}: 输入节点的内容
        - {file.content}: 文件内容
        - {node.output}: 其他节点的输出
        - {variable}: 上下文变量
        """
        # 实现模板渲染逻辑
        pass
```

---

## 八、开发任务分解

### 阶段一：后端基础（预计 2-3 天）

| 任务 | 描述 | 优先级 |
|-----|------|-------|
| 1.1 | 创建工作流相关数据库模型 | P0 |
| 1.2 | 生成数据库迁移 | P0 |
| 1.3 | 实现工作流 CRUD API | P0 |
| 1.4 | 实现节点和边管理 API | P0 |
| 1.5 | 实现 OpenAI 集成 | P0 |
| 1.6 | 添加 API 测试 | P1 |

### 阶段二：执行引擎（预计 2-3 天）

| 任务 | 描述 | 优先级 |
|-----|------|-------|
| 2.1 | 实现拓扑排序算法 | P0 |
| 2.2 | 实现节点执行器基类 | P0 |
| 2.3 | 实现 AI 节点执行器 | P0 |
| 2.4 | 实现文件节点执行器 | P0 |
| 2.5 | 实现执行引擎核心逻辑 | P0 |
| 2.6 | 实现执行状态管理 | P0 |

### 阶段三：前端工作流编辑器（预计 3-4 天）

| 任务 | 描述 | 优先级 |
|-----|------|-------|
| 3.1 | 创建 workflowStore | P0 |
| 3.2 | 实现 FlowCanvas 组件 | P0 |
| 3.3 | 实现自定义节点组件 | P0 |
| 3.4 | 实现 Inspector 组件 | P0 |
| 3.5 | 实现工作流列表页面 | P0 |
| 3.6 | 实现工作流编辑器页面 | P0 |

### 阶段四：执行功能（预计 2-3 天）

| 任务 | 描述 | 优先级 |
|-----|------|-------|
| 4.1 | 创建 executionStore | P0 |
| 4.2 | 实现执行状态组件 | P0 |
| 4.3 | 实现执行历史组件 | P0 |
| 4.4 | 实现实时状态更新 | P0 |
| 4.5 | 实现执行日志查看 | P1 |

### 阶段五：整合与优化（预计 1-2 天）

| 任务 | 描述 | 优先级 |
|-----|------|-------|
| 5.1 | 整合前后端功能 | P0 |
| 5.2 | 添加错误处理 | P0 |
| 5.3 | 优化执行性能 | P1 |
| 5.4 | 添加单元测试 | P1 |
| 5.5 | 文档完善 | P2 |

---

## 九、测试计划

### 9.1 后端测试

- 工作流 CRUD 操作测试
- 节点和边管理测试
- 执行引擎测试
  - 拓扑排序测试
  - 节点执行测试
  - 错误处理测试
- AI 服务集成测试
- 性能测试（大工作流执行）

### 9.2 前端测试

- 工作流编辑器测试
  - 节点拖拽和连接
  - 节点配置
  - 画布操作
- 执行状态测试
  - 实时更新
  - 执行日志显示
- 状态管理测试
- 响应式布局测试

---

## 十、注意事项

### 10.1 性能考虑

- 执行引擎使用异步处理
- 大工作流使用队列系统
- 前端使用虚拟滚动显示大量节点
- 执行日志分页加载

### 10.2 安全考虑

- AI API 密钥管理
- 用户权限验证
- 输入内容过滤
- 执行超时控制

### 10.3 用户体验

- 实时执行状态反馈
- 执行进度可视化
- 错误信息清晰展示
- 操作撤销/重做
- 快捷键支持

### 10.4 可靠性

- 执行失败重试机制
- 执行状态持久化
- 系统监控和报警

---

## 十一、后续扩展

- 支持更多 AI 模型（Claude、Gemini 等）
- 实现工作流模板库
- 添加定时执行功能
- 支持并行执行
- 实现工作流版本控制
- 添加团队协作功能
- 支持更复杂的节点类型（循环、条件分支等）
- 集成更多外部服务（数据库、API 等）

---

## 十二、技术要点

1. **拓扑排序**：使用 Kahn 算法或 DFS 实现有向无环图的拓扑排序，确保节点按正确顺序执行

2. **上下文传递**：设计灵活的上下文机制，支持节点间数据流转和变量引用

3. **实时通信**：使用 WebSocket 或 SSE 实现执行状态的实时推送

4. **模板引擎**：实现强大的 Prompt 模板系统，支持各种占位符和变量

5. **错误处理**：设计完善的错误处理机制，确保执行过程中的异常能够被正确捕获和处理

6. **可扩展性**：采用插件架构，支持轻松添加新的节点类型和执行器

7. **性能优化**：使用异步编程、缓存策略和批处理等技术优化执行性能

8. **用户界面**：设计直观、易用的工作流编辑器，提供丰富的可视化反馈

---

## 十三、预期成果

1. **完整的工作流管理系统**：支持创建、编辑、执行和管理工作流

2. **强大的 AI 集成**：支持调用 OpenAI 模型，实现智能文本处理

3. **灵活的节点系统**：支持输入、输出、AI、文件读写等多种节点类型

4. **实时执行状态**：提供实时的执行状态更新和详细的执行日志

5. **用户友好的界面**：直观的工作流编辑器和执行状态展示

6. **可扩展的架构**：易于添加新功能和集成新服务

通过本计划的实施，我们将构建一个功能强大、性能可靠的 AI 工作流执行系统，为用户提供智能化的文本处理能力。