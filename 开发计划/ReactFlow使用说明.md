# React Flow 使用说明

## 1. 概述

React Flow 是一个用于构建交互式节点编辑器的 React 库，本项目使用它来实现工作流可视化编辑功能。

## 2. 安装

```bash
npm install @xyflow/react
```

## 3. 核心组件

### 3.1 FlowCanvas

主画布组件，负责显示和管理工作流节点和边。

**位置**: `src/components/FlowCanvas/index.tsx`

**功能**:
- 显示工作流画布
- 支持节点拖拽和连接
- 支持缩放和移动
- 支持节点选择
- 集成了 MiniMap、Controls 和 Background 组件

**Props**:
- `flowId`: 工作流 ID
- `nodes`: 节点数组
- `edges`: 边数组
- `onNodesChange`: 节点变化回调
- `onEdgesChange`: 边变化回调
- `onNodeSelect`: 节点选择回调

### 3.2 自定义节点

#### 3.2.1 InputNode

输入节点，用于提供工作流的输入数据。

**位置**: `src/components/FlowCanvas/nodes/InputNode.tsx`

**功能**:
- 配置输入名称和类型
- 提供一个输出端口

#### 3.2.2 OutputNode

输出节点，用于接收工作流的输出数据。

**位置**: `src/components/FlowCanvas/nodes/OutputNode.tsx`

**功能**:
- 配置输出名称和类型
- 提供一个输入端口

#### 3.2.3 AINode

AI 节点，用于使用 AI 模型处理数据。

**位置**: `src/components/FlowCanvas/nodes/AINode.tsx`

**功能**:
- 选择 AI 模型
- 配置 Prompt
- 显示执行状态
- 提供输入和输出端口

#### 3.2.4 FileReaderNode

文件读取节点，用于从文件系统读取文件内容。

**位置**: `src/components/FlowCanvas/nodes/FileReaderNode.tsx`

**功能**:
- 配置文件路径
- 选择编码格式
- 提供一个输出端口

#### 3.2.5 FileWriterNode

文件写入节点，用于将数据写入文件系统。

**位置**: `src/components/FlowCanvas/nodes/FileWriterNode.tsx`

**功能**:
- 配置文件路径
- 选择编码格式
- 配置是否覆盖现有文件
- 提供一个输入端口

### 3.3 画布控件

#### 3.3.1 MiniMap

迷你地图组件，显示整个工作流的缩略图。

**位置**: `src/components/FlowCanvas/controls/MiniMap.tsx`

#### 3.3.2 Controls

控制组件，提供缩放、移动等操作按钮。

**位置**: `src/components/FlowCanvas/controls/Controls.tsx`

#### 3.3.3 Background

背景组件，显示网格背景。

**位置**: `src/components/FlowCanvas/controls/Background.tsx`

### 3.4 Inspector

检查器组件，用于配置节点和工作流属性。

**位置**: `src/components/Inspector/index.tsx`

**功能**:
- 切换节点配置、工作流配置和执行状态标签
- 显示对应标签的配置界面

## 4. 数据结构

### 4.1 节点结构

```typescript
interface Node {
  id: string;
  type: string; // "input", "output", "ai", "fileReader", "fileWriter"
  position: { x: number; y: number };
  data: any; // 根据节点类型不同而不同
}
```

### 4.2 边结构

```typescript
interface Edge {
  id: string;
  source: string; // 源节点 ID
  target: string; // 目标节点 ID
  type?: string; // 边的类型
}
```

## 5. 使用示例

### 5.1 基本用法

```typescript
import FlowCanvas from "@/components/FlowCanvas";

// 初始节点
const initialNodes = [
  {
    id: "n1",
    type: "input",
    position: { x: 100, y: 200 },
    data: { label: "输入节点", name: "input", type: "text" }
  },
  {
    id: "n2",
    type: "ai",
    position: { x: 350, y: 200 },
    data: { label: "AI 节点", model: "gpt-3.5-turbo", prompt: "请总结以下内容: {{input}}" }
  },
  {
    id: "n3",
    type: "output",
    position: { x: 600, y: 200 },
    data: { label: "输出节点", name: "output", type: "text" }
  }
];

// 初始边
const initialEdges = [
  { id: "e1", source: "n1", target: "n2" },
  { id: "e2", source: "n2", target: "n3" }
];

// 组件使用
<FlowCanvas
  flowId={1}
  nodes={initialNodes}
  edges={initialEdges}
  onNodesChange={handleNodesChange}
  onEdgesChange={handleEdgesChange}
  onNodeSelect={handleNodeSelect}
/>
```

### 5.2 事件处理

```typescript
// 节点变化处理
const handleNodesChange = (newNodes) => {
  setNodes(newNodes);
};

// 边变化处理
const handleEdgesChange = (newEdges) => {
  setEdges(newEdges);
};

// 节点选择处理
const handleNodeSelect = (nodeId) => {
  setSelectedNodeId(nodeId);
};
```

## 6. 工作流执行

### 6.1 执行流程

1. 用户点击 "执行工作流" 按钮
2. 前端发送执行请求到后端
3. 后端按照拓扑顺序执行各个节点
4. 前端实时显示执行状态和日志

### 6.2 执行状态

- `pending`: 等待执行
- `running`: 正在执行
- `completed`: 执行完成
- `failed`: 执行失败

## 7. 注意事项

1. **性能优化**: 对于大型工作流，建议使用虚拟滚动和节点缓存
2. **错误处理**: 实现节点执行错误的捕获和显示
3. **数据持久化**: 定期保存工作流状态到后端
4. **权限控制**: 确保只有授权用户可以编辑和执行工作流

## 8. 扩展建议

1. **自定义节点**: 可以根据业务需求创建更多类型的节点
2. **模板系统**: 实现工作流模板，方便用户快速创建常见工作流
3. **版本控制**: 为工作流添加版本控制功能
4. **协作编辑**: 支持多人同时编辑工作流
5. **监控系统**: 实现工作流执行的监控和告警

## 9. 参考文档

- [React Flow 官方文档](https://reactflow.dev/)
- [React Flow GitHub 仓库](https://github.com/xyflow/xyflow)
- [React Flow 示例](https://reactflow.dev/examples/)