# AI工作流执行引擎完善规划

## 一、项目概述

### 1.1 目标

完善AI工作流执行引擎，实现复杂的数据流转和文件操作，支持用户自定义AI节点的提示词和数据注入方式。

### 1.2 核心需求

1. AI节点支持多输入（上侧和左侧）和多输出
2. AI节点的提示词编辑器支持可视化数据源管理
3. 文件读取节点和文件写入节点的完整实现
4. 工作流执行顺序的正确管理
5. 文件内容与AI提示词的动态整合

---

## 二、AI节点提示词编辑器设计

### 2.1 功能需求

1. **数据源可视化**：
   - 显示所有连接到AI节点的数据源
   - 区分上侧输入（一般数据）和左侧输入（文件数据）
   - 显示数据源来源节点名称

2. **提示词模板编辑**：
   - 支持富文本编辑
   - 支持变量插入（{input1}, {file1}等）
   - 支持变量高亮和提示

3. **变量管理**：
   - 自动检测连接的数据源
   - 为每个数据源生成变量名
   - 支持用户自定义变量名
   - 显示变量类型和数据来源

### 2.2 UI设计

```
┌─────────────────────────────────────────────────────────────┐
│  AI节点配置                                              │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 数据源管理                                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 上侧输入（一般数据）:                           │   │
│  │  ┌─────────────────────────────────────────────┐ │   │
│  │  │ {input1} - 来自: 输入节点              │ │   │
│  │  │ {input2} - 来自: 上一个AI节点          │ │   │
│  │  └─────────────────────────────────────────────┘ │   │
│  │                                                   │   │
│  │ 左侧输入（文件数据）:                           │   │
│  │  ┌─────────────────────────────────────────────┐ │   │
│  │  │ {file1} - 来自: 文件读取节点1         │ │   │
│  │  │ {file2} - 来自: 文件读取节点2         │ │   │
│  │  └─────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 提示词编辑器                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 请分析以下数据：                                │   │
│  │                                                   │   │
│  │ 用户输入: {input1}                               │   │
│  │                                                   │   │
│  │ 文件内容: {file1}                                │   │
│  │                                                   │   │
│  │ 请根据以上信息生成回复...                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 输出配置                                        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ 下侧输出: {output}                               │   │
│  │ 右侧输出: {file_output}                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 数据结构

```typescript
interface AINodeData {
  name: string;
  model: string;
  prompt: string;
  variables: {
    // 上侧输入变量
    inputs: Array<{
      id: string;
      name: string;
      sourceNodeId: string;
      sourceNodeName: string;
      type: "input";
    }>;
    // 左侧输入变量（文件）
    files: Array<{
      id: string;
      name: string;
      sourceNodeId: string;
      sourceNodeName: string;
      type: "file";
      filePath: string;
    }>;
  };
  outputs: {
    // 下侧输出
    bottom?: string;
    // 右侧输出（文件）
    right?: string;
  };
}
```

---

## 三、文件读取节点实现

### 3.1 功能需求

1. **文件选择**：
   - 从虚拟文件系统选择文件
   - 显示文件路径和内容预览
   - 支持编码选择

2. **数据输出**：
   - 只有一个右侧输出点
   - 输出文件内容到连接的节点

### 3.2 UI设计

```
┌─────────────────────────────────────────────────────────────┐
│  文件读取节点配置                                        │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  文件路径: /data/example.txt                            │
│  [选择文件]                                              │
│                                                           │
│  编码格式: UTF-8 ▼                                      │
│                                                           │
│  文件预览:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 这是文件内容...                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 数据结构

```typescript
interface FileReaderNodeData {
  name: string;
  filePath: string;
  encoding: string;
  fileId: number;
}
```

---

## 四、文件写入节点实现

### 4.1 功能需求

1. **写入模式选择**：
   - 直接写入模式：直接将输入数据写入文件
   - AI修改模式：通过AI修改原文件内容后写入

2. **文件选择**：
   - 从虚拟文件系统选择文件
   - 显示文件路径
   - 支持覆盖选项

3. **数据输入**：
   - 只有一个左侧输入点
   - 接收来自其他节点的数据

### 4.2 UI设计

```
┌─────────────────────────────────────────────────────────────┐
│  文件写入节点配置                                        │
├─────────────────────────────────────────────────────────────┤
│                                                           │
│  写入模式: ○ 直接写入  ● AI修改                      │
│                                                           │
│  文件路径: /data/output.txt                            │
│  [选择文件]                                              │
│                                                           │
│  覆盖原文件: ☑                                         │
│                                                           │
│  AI修改提示词（仅AI修改模式）:                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 请根据以下内容修改文件：                        │   │
│  │                                                   │   │
│  │ 原文件内容: {file_content}                        │   │
│  │                                                   │   │
│  │ 新数据: {input_data}                               │   │
│  │                                                   │   │
│  │ 请修改原文件内容...                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 数据结构

```typescript
interface FileWriterNodeData {
  name: string;
  filePath: string;
  fileId: number;
  mode: "direct" | "ai";
  overwrite: boolean;
  aiPrompt?: string;
}
```

---

## 五、执行引擎改进

### 5.1 执行流程

```
1. 工作流解析
   ├─ 构建节点依赖图
   ├─ 识别所有连接关系（包括handle信息）
   └─ 确定执行顺序

2. 数据源分析
   ├─ 分析每个AI节点的输入来源
   ├─ 区分上侧输入和左侧输入
   └─ 生成变量映射关系

3. 执行准备
   ├─ 创建执行记录
   ├─ 初始化节点状态
   └─ 加载文件内容

4. 节点执行
   ├─ 执行文件读取节点
   │  ├─ 读取文件内容
   │  └─ 传递到连接的节点
   ├─ 执行AI节点
   │  ├─ 收集所有输入数据
   │  ├─ 替换提示词中的变量
   │  ├─ 调用AI模型
   │  └─ 分发输出数据
   ├─ 执行文件写入节点
   │  ├─ 根据写入模式处理数据
   │  ├─ 直接写入或AI修改后写入
   │  └─ 更新文件内容
   └─ 执行结束节点
      ├─ 收集所有最终输出
      └─ 完成执行

5. 状态管理
   ├─ 实时更新执行状态
   ├─ 记录执行日志
   └─ 处理错误和异常
```

### 5.2 数据流管理

```python
class DataFlowManager:
    def __init__(self):
        self.node_data = {}  # 节点数据存储
        self.file_cache = {}  # 文件内容缓存

    def set_node_data(self, node_id: int, handle: str, data: any):
        """设置节点输出数据"""
        key = f"{node_id}:{handle}"
        self.node_data[key] = data

    def get_node_data(self, node_id: int, handle: str) -> any:
        """获取节点输入数据"""
        key = f"{node_id}:{handle}"
        return self.node_data.get(key)

    def get_all_inputs(self, node_id: int) -> dict:
        """获取节点的所有输入数据"""
        inputs = {}
        for key, data in self.node_data.items():
            target_node_id, target_handle = key.split(':')
            if int(target_node_id) == node_id:
                inputs[target_handle] = data
        return inputs

    def load_file_content(self, file_path: str) -> str:
        """加载文件内容"""
        if file_path not in self.file_cache:
            self.file_cache[file_path] = self._read_file(file_path)
        return self.file_cache[file_path]
```

### 5.3 AI节点执行器

```python
class AINodeExecutor:
    def __init__(self, ai_service):
        self.ai_service = ai_service

    def execute(self, node: Node, context: dict) -> dict:
        # 1. 收集输入数据
        inputs = self._collect_inputs(node, context)

        # 2. 替换提示词中的变量
        prompt = self._replace_variables(node.data['prompt'], inputs)

        # 3. 调用AI模型
        response = self.ai_service.chat(
            messages=[{"role": "user", "content": prompt}],
            model=node.data.get('model', 'gpt-3.5-turbo')
        )

        # 4. 分发输出数据
        outputs = self._distribute_outputs(response, node.data)

        return outputs

    def _collect_inputs(self, node: Node, context: dict) -> dict:
        """收集所有输入数据"""
        inputs = {}

        # 收集上侧输入数据
        top_inputs = context.get('top_inputs', {})
        for input_id, input_data in top_inputs.items():
            inputs[f'input_{input_id}'] = input_data

        # 收集左侧输入数据（文件）
        left_inputs = context.get('left_inputs', {})
        for file_id, file_data in left_inputs.items():
            inputs[f'file_{file_id}'] = file_data

        return inputs

    def _replace_variables(self, prompt: str, inputs: dict) -> str:
        """替换提示词中的变量"""
        for var_name, var_value in inputs.items():
            prompt = prompt.replace(f'{{{var_name}}}', str(var_value))
        return prompt

    def _distribute_outputs(self, response: dict, node_data: dict) -> dict:
        """分发输出数据"""
        outputs = {}

        # 下侧输出
        if node_data.get('outputs', {}).get('bottom'):
            outputs['bottom'] = response['content']

        # 右侧输出（文件）
        if node_data.get('outputs', {}).get('right'):
            outputs['right'] = response['content']

        return outputs
```

### 5.4 文件读取节点执行器

```python
class FileReaderNodeExecutor:
    def __init__(self, file_service):
        self.file_service = file_service

    def execute(self, node: Node, context: dict) -> dict:
        # 1. 获取文件路径
        file_path = node.data['filePath']
        encoding = node.data.get('encoding', 'utf-8')

        # 2. 读取文件内容
        content = self.file_service.read_file(file_path, encoding)

        # 3. 返回文件内容
        return {
            'right': content
        }
```

### 5.5 文件写入节点执行器

```python
class FileWriterNodeExecutor:
    def __init__(self, file_service, ai_service):
        self.file_service = file_service
        self.ai_service = ai_service

    def execute(self, node: Node, context: dict) -> dict:
        # 1. 获取输入数据
        input_data = context.get('left_input')

        # 2. 根据写入模式处理数据
        mode = node.data.get('mode', 'direct')

        if mode == 'direct':
            # 直接写入模式
            content = input_data
        else:
            # AI修改模式
            file_path = node.data['filePath']
            original_content = self.file_service.read_file(file_path)

            # 替换提示词中的变量
            prompt = node.data.get('aiPrompt', '')
            prompt = prompt.replace('{file_content}', original_content)
            prompt = prompt.replace('{input_data}', str(input_data))

            # 调用AI模型
            response = self.ai_service.chat(
                messages=[{"role": "user", "content": prompt}],
                model='gpt-3.5-turbo'
            )
            content = response['content']

        # 3. 写入文件
        file_path = node.data['filePath']
        overwrite = node.data.get('overwrite', True)
        self.file_service.write_file(file_path, content, overwrite)

        return {}
```

---

## 六、前端实现步骤

### 6.1 AI节点提示词编辑器

1. **创建提示词编辑器组件**：
   - 文件：`frontend/src/components/AINode/PromptEditor.tsx`
   - 功能：支持富文本编辑、变量插入、变量高亮

2. **创建数据源管理组件**：
   - 文件：`frontend/src/components/AINode/DataSourceManager.tsx`
   - 功能：显示所有连接的数据源，支持变量管理

3. **集成到节点配置**：
   - 修改：`frontend/src/components/Inspector/NodeConfig.tsx`
   - 为AI节点添加提示词编辑器和数据源管理

### 6.2 文件读取节点配置

1. **创建文件选择组件**：
   - 文件：`frontend/src/components/FileNode/FileSelector.tsx`
   - 功能：从虚拟文件系统选择文件

2. **集成到节点配置**：
   - 修改：`frontend/src/components/Inspector/NodeConfig.tsx`
   - 为文件读取节点添加文件选择功能

### 6.3 文件写入节点配置

1. **创建写入模式选择组件**：
   - 文件：`frontend/src/components/FileNode/WriteModeSelector.tsx`
   - 功能：选择直接写入或AI修改模式

2. **创建AI提示词编辑器**：
   - 文件：`frontend/src/components/FileNode/AIPromptEditor.tsx`
   - 功能：编辑AI修改提示词

3. **集成到节点配置**：
   - 修改：`frontend/src/components/Inspector/NodeConfig.tsx`
   - 为文件写入节点添加配置功能

---

## 七、后端实现步骤

### 7.1 执行引擎核心

1. **创建数据流管理器**：
   - 文件：`backend/app/modules/workflow/engine/data_flow.py`
   - 功能：管理节点间的数据流转

2. **创建节点执行器**：
   - 文件：`backend/app/modules/workflow/engine/executors.py`
   - 功能：实现各种节点的执行逻辑

3. **创建执行引擎**：
   - 文件：`backend/app/modules/workflow/engine/engine.py`
   - 功能：实现工作流执行的核心逻辑

### 7.2 文件服务

1. **创建文件服务**：
   - 文件：`backend/app/services/file_service.py`
   - 功能：提供文件读取和写入功能

2. **集成虚拟文件系统**：
   - 修改：`backend/app/modules/filesystem/crud.py`
   - 添加文件内容读取和写入方法

### 7.3 API集成

1. **修改执行API**：
   - 文件：`backend/app/modules/workflow/routes.py`
   - 集成新的执行引擎

2. **添加文件操作API**：
   - 文件：`backend/app/modules/filesystem/routes.py`
   - 添加文件内容读取和写入接口

---

## 八、开发计划

### 第一阶段：AI节点提示词编辑器（2天）

1. **前端**：
   - 创建提示词编辑器组件
   - 创建数据源管理组件
   - 集成到节点配置

2. **后端**：
   - 修改节点数据模型
   - 更新API接口

### 第二阶段：文件节点实现（2天）

1. **前端**：
   - 创建文件选择组件
   - 创建写入模式选择组件
   - 集成到节点配置

2. **后端**：
   - 实现文件读取节点执行器
   - 实现文件写入节点执行器
   - 创建文件服务

### 第三阶段：执行引擎改进（2天）

1. **后端**：
   - 创建数据流管理器
   - 改进执行引擎逻辑
   - 支持多输入多输出

2. **前端**：
   - 更新执行状态展示
   - 优化执行日志显示

### 第四阶段：测试和优化（1天）

1. **测试**：
   - 创建测试工作流
   - 测试各种执行场景
   - 验证数据流转

2. **优化**：
   - 性能优化
   - 错误处理
   - 用户体验优化

---

## 九、预期结果

1. 用户可以在AI节点的提示词编辑器中看到所有连接的数据源
2. 用户可以通过变量名（如{input1}, {file1}）将数据注入到提示词中
3. 文件读取节点可以读取虚拟文件系统中的文件内容
4. 文件写入节点支持直接写入和AI修改两种模式
5. 执行引擎能够正确处理多输入多输出的数据流转
6. 工作流执行状态和日志能够实时更新

---

## 十、技术要点

### 10.1 变量替换

- 使用正则表达式匹配变量：`\{(\w+)\}`
- 支持嵌套变量和复杂表达式
- 提供变量验证和错误提示

### 10.2 数据流管理

- 使用字典存储节点数据
- 支持多种数据类型（字符串、数字、对象、数组）
- 提供数据转换和验证功能

### 10.3 文件操作

- 支持多种编码格式
- 提供文件锁定机制
- 支持大文件流式处理

### 10.4 执行顺序

- 使用拓扑排序确定执行顺序
- 支持并行执行无依赖的节点
- 提供执行进度跟踪
