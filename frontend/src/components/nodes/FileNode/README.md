# 文件节点组件

包含文件相关的所有节点组件，包括文件读取、文件写入和文件夹写入节点。

## 组件列表

### 1. 文件读取节点

- **FileReaderNode.tsx** - 画布中显示的文件读取节点
- **FileReaderNodeConfig.tsx** - 右侧面板中的文件读取节点配置（只读）
- **FileReaderNodeEditor.tsx** - 右键菜单打开的文件读取节点编辑弹窗

### 2. 文件写入节点

- **FileWriterNode.tsx** - 画布中显示的文件写入节点
- **FileWriterNodeConfig.tsx** - 右侧面板中的文件写入节点配置（只读）
- **FileWriterNodeEditor.tsx** - 右键菜单打开的文件写入节点编辑弹窗

### 3. 文件夹写入节点

- **FolderWriterNode.tsx** - 画布中显示的文件夹写入节点
- **FolderWriterNodeConfig.tsx** - 右侧面板中的文件夹写入节点配置（只读）
- **FolderWriterNodeEditor.tsx** - 右键菜单打开的文件夹写入节点编辑弹窗

## 子组件

- **FileSelector.tsx** - 文件/文件夹选择器
  - 支持文件和文件夹选择
  - 支持路径输入和搜索
  - 支持文件夹过滤模式

- **WriteModeSelector.tsx** - 写入模式选择器（用于文件写入节点）
  - 直接写入模式
  - AI修改模式

- **AIPromptEditor.tsx** - AI提示词编辑器（用于文件写入节点的AI修改模式）
  - 支持变量占位符
  - 支持多行文本编辑

## 文件夹写入节点说明

### 功能

- 在指定文件夹中创建新文件并写入内容
- 从左侧输入端口接收数据
- 自动生成文件名（格式：output*年月日*时分秒.txt）
- 如果文件已存在，会自动添加序号

### 配置项

- **文件夹路径** - 选择要写入的目标文件夹

### 输入/输出

- **输入**：从左侧输入端口接收数据
- **输出**：无输出（只写入文件）

## 使用方式

### 导入组件

```tsx
// 方式1：单独导入
import FolderWriterNode from "./FileNode/FolderWriterNode";
import FolderWriterNodeConfig from "./FileNode/FolderWriterNodeConfig";
import FolderWriterNodeEditor from "./FileNode/FolderWriterNodeEditor";

// 方式2：统一导入
import {
  FolderWriterNode,
  FolderWriterNodeConfig,
  FolderWriterNodeEditor,
} from "./nodes";
```

### 节点类型

- **类型名称**：`folder_writer` 或 `folderWriter`
- **显示名称**：文件夹写入节点
- **颜色**：蓝色

## 示例

### 在工作流中使用文件夹写入节点

1. 从右侧节点选择器中选择"文件夹写入节点"
2. 拖拽到画布上合适的位置
3. 右键点击节点，选择"编辑"，配置目标文件夹
4. 从其他节点（如AI节点）的右侧连接到文件夹写入节点的左侧
5. 运行工作流时，文件夹写入节点会在指定文件夹中创建新文件并写入数据
