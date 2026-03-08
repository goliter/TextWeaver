# 文件节点组件

包含文件读取节点和文件写入节点的所有相关组件：
- 画布中的节点显示组件
- 节点配置组件
- 节点编辑弹窗组件
- 相关的子组件

## 组件列表

### FileReaderNode.tsx
画布中文件读取节点的显示组件，包含节点的视觉样式和连接点。

### FileReaderNodeConfig.tsx
文件读取节点的右侧配置面板，提供节点的详细配置界面。

### FileReaderNodeEditor.tsx
文件读取节点的编辑弹窗，通过右键菜单打开，提供完整的节点编辑功能。

### FileWriterNode.tsx
画布中文件写入节点的显示组件，包含节点的视觉样式和连接点。

### FileWriterNodeConfig.tsx
文件写入节点的右侧配置面板，提供节点的详细配置界面。

### FileWriterNodeEditor.tsx
文件写入节点的编辑弹窗，通过右键菜单打开，提供完整的节点编辑功能。

### FileSelector.tsx
文件选择器，提供文件路径选择和文件浏览功能。

### WriteModeSelector.tsx
写入模式选择器，支持直接写入和AI修改两种模式。

### AIPromptEditor.tsx
AI提示词编辑器，用于文件写入节点的AI修改模式。

## 使用方式

```tsx
import FileReaderNode from "./FileReaderNode";
import FileReaderNodeConfig from "./FileReaderNodeConfig";
import FileReaderNodeEditor from "./FileReaderNodeEditor";
import FileWriterNode from "./FileWriterNode";
import FileWriterNodeConfig from "./FileWriterNodeConfig";
import FileWriterNodeEditor from "./FileWriterNodeEditor";
```
