# AI节点组件

包含AI节点的所有相关组件：
- 画布中的节点显示组件
- 节点配置组件
- 节点编辑弹窗组件
- 相关的子组件

## 组件列表

### AINode.tsx
画布中AI节点的显示组件，包含节点的视觉样式和连接点。

### AINodeConfig.tsx
AI节点的右侧配置面板，提供节点的详细配置界面。

### AINodeEditor.tsx
AI节点的编辑弹窗，通过右键菜单打开，提供完整的节点编辑功能。

### PromptEditor.tsx
AI提示词编辑器，支持变量替换和语法高亮。

### DataSourceManager.tsx
数据源管理器，显示AI节点的输入数据源信息。

## 使用方式

```tsx
import AINode from "./AINode";
import AINodeConfig from "./AINodeConfig";
import AINodeEditor from "./AINodeEditor";
```
