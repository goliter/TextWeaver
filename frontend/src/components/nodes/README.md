# 节点组件目录

这个目录包含了所有工作流节点的相关组件，每个节点都有自己的独立文件夹。

## 目录结构

```
nodes/
├── AINode/              # AI节点组件
│   ├── README.md
│   ├── AINode.tsx
│   ├── AINodeConfig.tsx
│   ├── AINodeEditor.tsx
│   ├── PromptEditor.tsx
│   └── DataSourceManager.tsx
├── FileNode/            # 文件节点组件
│   ├── README.md
│   ├── FileReaderNode.tsx
│   ├── FileReaderNodeConfig.tsx
│   ├── FileReaderNodeEditor.tsx
│   ├── FileWriterNode.tsx
│   ├── FileWriterNodeConfig.tsx
│   ├── FileWriterNodeEditor.tsx
│   ├── FileSelector.tsx
│   ├── WriteModeSelector.tsx
│   └── AIPromptEditor.tsx
├── StartNode/           # 开始节点组件
│   ├── README.md
│   ├── StartNode.tsx
│   ├── StartNodeConfig.tsx
│   └── StartNodeEditor.tsx
├── EndNode/             # 结束节点组件
│   ├── README.md
│   ├── EndNode.tsx
│   ├── EndNodeConfig.tsx
│   └── EndNodeEditor.tsx
└── index.ts             # 统一导出
```

## 节点组件说明

每个节点文件夹包含三个主要组件：

1. **节点显示组件** (如 `AINode.tsx`)
   - 在画布中显示的节点视觉组件
   - 包含节点的样式、颜色和连接点
   - 处理节点的选中状态

2. **节点配置组件** (如 `AINodeConfig.tsx`)
   - 右侧面板中的节点配置界面
   - **只读展示组件**，仅用于展示节点配置信息
   - 不包含任何可编辑的输入框、选择框或按钮
   - 如需编辑，请使用右键菜单打开节点编辑弹窗

3. **节点编辑组件** (如 `AINodeEditor.tsx`)
   - 通过右键菜单打开的编辑弹窗
   - 提供完整的节点编辑功能
   - 支持保存和取消操作
   - 包含所有可编辑的配置项

## 使用方式

### 导入单个节点组件

```tsx
import AINode from "./nodes/AINode/AINode";
import AINodeConfig from "./nodes/AINode/AINodeConfig";
import AINodeEditor from "./nodes/AINode/AINodeEditor";
```

### 统一导入所有节点组件

```tsx
import {
  AINode,
  AINodeConfig,
  AINodeEditor,
  FileReaderNode,
  FileReaderNodeConfig,
  FileReaderNodeEditor,
  FileWriterNode,
  FileWriterNodeConfig,
  FileWriterNodeEditor,
  StartNode,
  StartNodeConfig,
  StartNodeEditor,
  EndNode,
  EndNodeConfig,
  EndNodeEditor,
} from "./nodes";
```

## 添加新节点

当需要添加新节点时，请按照以下步骤：

1. 在 `nodes/` 目录下创建新的文件夹（如 `NewNode/`）
2. 创建 `README.md` 文件，说明节点功能
3. 创建三个主要组件：
   - `NewNode.tsx` - 节点显示组件
   - `NewNodeConfig.tsx` - 节点配置组件
   - `NewNodeEditor.tsx` - 节点编辑组件
4. 如有需要，创建相关的子组件
5. 在 `nodes/index.ts` 中导出新节点组件
6. 更新本 README 文件

## 组件规范

### 节点显示组件

- 使用 `@xyflow/react` 的 `Handle` 和 `Position` 组件
- 实现选中状态的样式变化
- 保持节点样式的一致性
- 节点宽度建议为 `w-40`

### 节点配置组件

- **只读展示组件**，不包含任何编辑功能
- 仅接收 `node` 和 `edges` 属性用于展示
- 所有配置项使用只读的灰色背景展示框
- 如需编辑，请使用右键菜单打开节点编辑弹窗

### 节点编辑组件

- 使用弹窗形式展示
- 提供 `isOpen`、`node`、`onSave`、`onCancel` 属性
- 使用 `useEffect` 同步节点数据
- 提供保存和取消按钮

## 注意事项

- 所有节点组件都应该保持一致的样式和交互方式
- 节点数据结构应该与后端API保持一致
- 避免在节点组件中直接修改节点数据，应该通过回调函数更新
- 确保节点组件的可访问性和响应式设计
