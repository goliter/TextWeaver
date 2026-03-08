# 前端组件重组说明

## 重组概述

为了更好地管理和维护前端组件，我们将所有节点相关的组件进行了重新组织。现在每个节点的所有相关组件（画布节点显示、右侧配置、右键编辑弹窗）都统一放在一个以节点名称命名的文件夹中。

## 重组前的问题

1. **组件分散**：节点相关的组件分散在不同的目录中
   - 画布节点组件在 `FlowCanvas/nodes/` 目录
   - 配置组件在 `Inspector/` 目录
   - 编辑弹窗在 `workflow/` 目录
   - 子组件在 `AINode/` 和 `FileNode/` 目录

2. **难以维护**：修改一个节点需要查找多个文件
3. **导入复杂**：需要从不同路径导入相关组件
4. **结构不清晰**：新开发者难以理解组件之间的关系

## 重组后的结构

```
components/
├── nodes/                          # 节点组件目录（新增）
│   ├── README.md                   # 节点组件总说明
│   ├── index.ts                    # 统一导出
│   ├── AINode/                     # AI节点
│   │   ├── README.md
│   │   ├── AINode.tsx              # 画布节点显示
│   │   ├── AINodeConfig.tsx        # 右侧配置
│   │   ├── AINodeEditor.tsx        # 右键编辑弹窗
│   │   ├── PromptEditor.tsx        # 提示词编辑器
│   │   └── DataSourceManager.tsx   # 数据源管理器
│   ├── FileNode/                   # 文件节点
│   │   ├── README.md
│   │   ├── FileReaderNode.tsx      # 文件读取节点显示
│   │   ├── FileReaderNodeConfig.tsx # 文件读取节点配置
│   │   ├── FileReaderNodeEditor.tsx # 文件读取节点编辑
│   │   ├── FileWriterNode.tsx       # 文件写入节点显示
│   │   ├── FileWriterNodeConfig.tsx # 文件写入节点配置
│   │   ├── FileWriterNodeEditor.tsx # 文件写入节点编辑
│   │   ├── FileSelector.tsx        # 文件选择器
│   │   ├── WriteModeSelector.tsx   # 写入模式选择器
│   │   └── AIPromptEditor.tsx      # AI提示词编辑器
│   ├── StartNode/                  # 开始节点
│   │   ├── README.md
│   │   ├── StartNode.tsx           # 开始节点显示
│   │   ├── StartNodeConfig.tsx     # 开始节点配置
│   │   └── StartNodeEditor.tsx     # 开始节点编辑
│   └── EndNode/                    # 结束节点
│       ├── README.md
│       ├── EndNode.tsx             # 结束节点显示
│       ├── EndNodeConfig.tsx       # 结束节点配置
│       └── EndNodeEditor.tsx       # 结束节点编辑
├── AINode/                         # 旧目录（待删除）
├── FileNode/                       # 旧目录（待删除）
├── FlowCanvas/nodes/               # 旧目录（待删除）
├── Inspector/                       # 保留（其他检查器组件）
├── workflow/                        # 保留（其他工作流组件）
└── ...                             # 其他组件
```

## 重组的优势

1. **组件集中管理**：每个节点的所有组件都在一个文件夹中
2. **易于维护**：修改一个节点只需要在一个文件夹中操作
3. **导入简化**：可以从统一的位置导入所有节点组件
4. **结构清晰**：新开发者可以快速理解组件关系
5. **便于扩展**：添加新节点时只需要创建新的文件夹

## 使用方式

### 方式1：从统一位置导入

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
  EndNodeEditor
} from "@/components/nodes";
```

### 方式2：从具体节点文件夹导入

```tsx
import AINode from "@/components/nodes/AINode/AINode";
import AINodeConfig from "@/components/nodes/AINode/AINodeConfig";
import AINodeEditor from "@/components/nodes/AINode/AINodeEditor";
```

## 迁移指南

### 需要更新的文件

1. **FlowCanvas/index.tsx** - 更新节点组件的导入路径
2. **Inspector/NodeConfig.tsx** - 更新配置组件的导入路径
3. **workflow/NodeEditorDialog.tsx** - 更新编辑弹窗的导入路径
4. **其他使用节点组件的文件** - 更新相应的导入路径

### 迁移步骤

1. 更新导入语句，使用新的路径
2. 测试所有节点功能是否正常
3. 确认没有遗漏的导入
4. 删除旧的组件目录

### 导入路径对照表

| 旧路径 | 新路径 |
|--------|--------|
| `../FlowCanvas/nodes/AINode` | `../nodes/AINode/AINode` |
| `../AINode/PromptEditor` | `../nodes/AINode/PromptEditor` |
| `../FileNode/FileSelector` | `../nodes/FileNode/FileSelector` |
| `../FlowCanvas/nodes/StartNode` | `../nodes/StartNode/StartNode` |
| `../FlowCanvas/nodes/EndNode` | `../nodes/EndNode/EndNode` |

## 组件命名规范

每个节点文件夹包含以下组件：

1. **节点显示组件**：`{NodeName}.tsx`
   - 例如：`AINode.tsx`、`FileReaderNode.tsx`

2. **节点配置组件**：`{NodeName}Config.tsx`
   - 例如：`AINodeConfig.tsx`、`FileReaderNodeConfig.tsx`

3. **节点编辑组件**：`{NodeName}Editor.tsx`
   - 例如：`AINodeEditor.tsx`、`FileReaderNodeEditor.tsx`

4. **子组件**：根据需要添加
   - 例如：`PromptEditor.tsx`、`FileSelector.tsx`

## 添加新节点

当需要添加新节点时，请按照以下步骤：

1. 在 `components/nodes/` 目录下创建新的文件夹（如 `NewNode/`）
2. 创建 `README.md` 文件，说明节点功能
3. 创建三个主要组件：
   - `NewNode.tsx` - 节点显示组件
   - `NewNodeConfig.tsx` - 节点配置组件
   - `NewNodeEditor.tsx` - 节点编辑组件
4. 如有需要，创建相关的子组件
5. 在 `components/nodes/index.ts` 中导出新节点组件
6. 更新 `components/nodes/README.md` 文件

## 注意事项

1. **向后兼容**：在完全迁移之前，旧的组件目录暂时保留
2. **测试覆盖**：确保所有节点功能在迁移后正常工作
3. **文档更新**：及时更新相关文档和注释
4. **代码审查**：迁移完成后进行代码审查
5. **性能监控**：关注组件重组后的性能变化

## 待办事项

- [ ] 更新所有使用节点组件的文件的导入路径
- [ ] 测试所有节点功能
- [ ] 删除旧的组件目录
- [ ] 更新项目文档
- [ ] 通知团队成员新的组件结构

## 总结

通过这次组件重组，我们实现了：

- ✅ 更清晰的组件组织结构
- ✅ 更简单的组件导入方式
- ✅ 更容易的维护和扩展
- ✅ 更好的开发体验

这将有助于提高开发效率，降低维护成本，并为未来的功能扩展打下良好的基础。
