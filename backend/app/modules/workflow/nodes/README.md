# 节点执行器模块

本目录包含所有节点执行器的实现，每个节点类型对应一个执行器类。

## 节点类型

### 1. 开始节点 (start_node.py)
- **功能**：工作流的起始点
- **输入**：无
- **输出**：初始数据

### 2. AI 节点 (ai_node.py)
- **功能**：调用 AI 模型生成文本
- **输入**：支持多个输入，可映射到提示词变量
- **输出**：AI 生成的文本
- **配置**：
  - `model`: AI 模型名称（如 gpt-3.5-turbo）
  - `prompt`: 用户提示词模板
  - `system_prompt`: 系统提示词（可选）
- **依赖**：LangChain 服务

### 3. 结束节点 (end_node.py)
- **功能**：工作流的结束点
- **输入**：最终结果
- **输出**：无

### 4. 文件读取节点 (file_reader_node.py)
- **功能**：从文件系统读取文件内容
- **输入**：文件 ID
- **输出**：文件内容

### 5. 文件写入节点 (file_writer_node.py)
- **功能**：将内容写入文件系统
- **输入**：文件内容
- **输出**：写入结果

## 基类

所有节点执行器都继承自 `NodeExecutor` 基类，实现 `execute` 方法。

```python
from app.modules.workflow.nodes.base import NodeExecutor

class CustomNodeExecutor(NodeExecutor):
    def execute(self, node: Node, input_data: Dict[str, Any]) -> Dict[str, Any]:
        # 实现节点执行逻辑
        pass
```

## LangChain 集成

AI 节点使用 LangChain 服务进行文本生成：

- 支持系统提示词和用户提示词
- 支持变量替换（将输入数据注入提示词）
- 支持自定义模型参数（温度、最大 token 数等）

## 配置说明

AI 节点的提示词支持变量替换，使用 `{variable_name}` 语法：

```
请根据以下内容回答问题：{context}

问题：{question}
```

执行时会自动将输入数据中的 `context` 和 `question` 替换到提示词中。
