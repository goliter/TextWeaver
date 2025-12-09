

# AI 文本工作流 MVP 架构蓝图

## 一、系统整体布局

**三栏设计**：

| 区域                       | 功能                                                         |
| -------------------------- | ------------------------------------------------------------ |
| 左侧（File Explorer）      | 虚拟文件系统，显示文件夹/文件层级结构，支持创建/重命名/删除文件和文件夹，文件内容存储在数据库中（Markdown/纯文本）。 |
| 中间（Flow Editor）        | AI 工作流可视化编辑器（React Flow），节点可拖拽、连接，可显示执行状态，节点可读取左侧文件或写入文件。 |
| 右侧（Inspector / Editor） | 当前选中节点或文件的详细信息，支持编辑 Prompt、文件内容或节点配置。 |

------

## 二、核心数据结构

### 1. 虚拟文件系统（File Resource）

**数据库表设计（PostgreSQL 示例）**：

```
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    parent_id INT NULL,       -- 父文件夹ID，NULL表示根目录
    name TEXT NOT NULL,
    type TEXT NOT NULL,       -- 'file' 或 'folder'
    content TEXT,             -- Markdown / 文本内容
    owner_id INT NOT NULL,    -- 用户ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

- **文件夹**：`type = folder`，`content = NULL`
- **文件**：`type = file`，`content` 存储 Markdown / 文本内容
- **覆盖式写入**：AI 节点写入时直接更新 `content` 字段
- **前端展示**：树形结构 + 可拖拽连接节点

------

### 2. 工作流 Flow JSON Schema

```
{
  "id": "flow_001",
  "name": "示例工作流",
  "nodes": [
    {
      "id": "n1",
      "type": "input",
      "label": "用户输入",
      "config": {
        "source": "manual", 
        "content": "初始文本内容"
      },
      "outputs": ["n2"]
    },
    {
      "id": "n2",
      "type": "ai",
      "label": "文本改写 AI",
      "config": {
        "model": "gpt-4o-mini",
        "prompt_template": "请将以下文本改写为更口语化风格：\n{input}",
        "max_tokens": 500,
        "temperature": 0.7
      },
      "inputs": ["n1"],
      "outputs": ["n3"]
    },
    {
      "id": "n3",
      "type": "file_writer",
      "label": "写入文件",
      "config": {
        "file_id": 123,
        "overwrite": true
      },
      "inputs": ["n2"],
      "outputs": []
    }
  ],
  "edges": [
    { "from": "n1", "to": "n2" },
    { "from": "n2", "to": "n3" }
  ]
}
```

- `nodes`：节点列表，每个节点可配置不同类型
- `edges`：节点连接关系
- **AI 节点支持结构化 Prompt**，可以使用 `{input}` 或 `{file.content}` 占位符
- **File Writer 节点**支持覆盖写入指定文件

------

### 3. 节点类型定义

| 类型        | 功能                     | config 关键字段                                         |
| ----------- | ------------------------ | ------------------------------------------------------- |
| input       | 用户手动输入文本         | `source: manual`, `content: string`                     |
| ai          | 调用 OpenAI 模型生成文本 | `model`, `prompt_template`, `temperature`, `max_tokens` |
| file_reader | 从文件读取内容           | `file_id`                                               |
| file_writer | 将输出写入文件           | `file_id`, `overwrite: true/false`                      |
| output      | 显示最终结果             | 无                                                      |

------

## 三、后端执行模型（Flow Engine）

**执行逻辑**：

1. 接收 Flow JSON
2. 按拓扑排序逐节点执行
3. **AI 节点执行**：
   - 解析 `prompt_template`，替换 `{input}` 或 `{file.content}` 占位符
   - 调用 OpenAI API (`gpt-4o-mini`)
   - 返回结果存入节点执行上下文
4. **File Reader / Writer 节点**：
   - Reader：读取 DB 中 `content` 字段
   - Writer：写入 DB 中 `content` 字段（覆盖模式）
5. 每个节点执行状态（pending / running / success / error）可实时返回前端
6. Flow 完成后返回最终输出结果

**Python FastAPI 示例执行模型（伪代码）**：

```
for node in topo_sorted_nodes:
    node.status = "running"
    if node.type == "ai":
        prompt = node.config["prompt_template"].format(**context)
        result = call_openai(prompt, model=node.config["model"])
        context[node.id] = result
    elif node.type == "file_reader":
        file_content = read_file(node.config["file_id"])
        context[node.id] = file_content
    elif node.type == "file_writer":
        write_file(node.config["file_id"], context[node.inputs[0]])
    node.status = "success"
```

------

## 四、前端交互设计

### 1. 左侧文件系统（考虑使用react flow自定义节点实现）

- 树形 UI（React + Tailwind + Tree 组件）
- 点击文件 / 文件夹 → 在右侧展示内容或配置
- 拖拽文件到 AI 节点 → 自动在 Prompt 中生成 `{file.content}` 占位符

### 2. 中间 Flow Editor

- React Flow 实现拖拽 + 连线
- 节点配置弹窗 / 右侧 inspector 编辑 Prompt 或参数
- 点击 Run → POST Flow JSON → 后端顺序执行
- 执行中可流式返回状态，节点颜色实时变化（灰→黄→绿/红）

### 3. 右侧 Inspector

- 显示选中节点或文件内容
- 可编辑节点配置 / Prompt / 文件内容
- 保存自动更新 DB / Flow JSON

------

## 五、MVP 功能清单

1. 创建 / 编辑 / 删除文件 & 文件夹（Markdown）
2. 创建 / 编辑工作流（拖拽节点 + 连线）
3. AI 节点支持结构化 Prompt（可引用上游节点或文件内容）
4. File Reader / Writer 节点
5. 一键执行工作流，显示执行状态
6. 覆盖写入文件内容
7. 右侧 Inspector 可编辑节点或文件配置
8. 流程 JSON 可存储 / 加载

------

## 六、技术栈推荐

| 层       | 技术栈                                                    |
| -------- | --------------------------------------------------------- |
| 前端     | React + VIte + Tailwind + React Flow + Monaco Editor      |
| 后端     | Python + FastAPI + PostgreSQL + Redis（缓存节点执行状态） |
| AI       | OpenAI GPT-4o-mini                                        |
| 数据存储 | PostgreSQL（文件 / Flow / 用户）                          |

------

## 七、扩展空间

- 后续支持 File Versioning / Undo / Redo
- 支持多用户协作 / 权限管理
- 支持更多 AI 节点类型（翻译、总结、分析、分类）
- 支持远程触发 / 自动执行 / 调度
- 支持真实磁盘或云存储文件系统替换虚拟文件系统

------





## 八、应用领域

完全可以的！你的 **AI 工作流平台**本质上是一个 **可视化、节点化、文件驱动的文本生成与处理系统**，小说创作只是一个应用场景。换思路，你可以把它看作一个 **“生成式文本工作流引擎”**，几乎所有文本相关的任务都能做。下面列几个方向：

------

## 1. 文案创作 / 内容生成

- **应用场景**：广告文案、社交媒体帖子、营销邮件
- **工作流示例**：
  - 输入产品信息 → AI 节点生成标题/广告文案 → 文案优化节点 → 文件写入
- **特点**：可以批量生成多版本文案，节点化控制风格、口吻、长度

------

## 2. 报告/总结生成

- **应用场景**：会议纪要、研究报告、数据分析总结
- **工作流示例**：
  - 输入原始数据或文档 → 文件读取节点 → AI 节点生成摘要 → 文件写入
- **特点**：支持多源文档聚合，自动生成条理清晰的报告

------

## 3. 教育 / 学习辅助

- **应用场景**：自动生成学习资料、试题、答案解析
- **工作流示例**：
  - 输入教材或知识点 → AI 节点生成练习题 → AI 节点生成答案解析 → 文件写入
- **特点**：可按章节或主题组织，自动更新知识库

------

## 4. 客服 / 问答系统构建

- **应用场景**：企业内部知识库问答、FAQ 自动生成
- **工作流示例**：
  - 输入产品文档 → AI 节点生成问答对 → 文件写入
  - 后续可用作 chatbot 数据源
- **特点**：可迭代优化，支持上下文更新

------

## 5. 翻译 / 文本风格转换

- **应用场景**：多语言翻译、文本风格改写（正式↔口语、文学↔简报）
- **工作流示例**：
  - 文件读取 → AI 节点翻译/改写 → 文件写入 → 后续可再次改写或检查
- **特点**：支持多轮迭代，保证一致性和风格统一

------

## 6. 数据清洗 / 结构化文本生成

- **应用场景**：从非结构化文本生成结构化表格或 JSON
- **工作流示例**：
  - 文本输入 → AI 节点提取信息 → AI 节点生成 JSON/CSV → 文件写入
- **特点**：可扩展到文档解析、信息抽取等任务