# AI 模块

本模块负责 AI 相关的功能，包括 LangChain 服务、提示词管理等。

## 模块结构

- `service.py`: AI 服务核心逻辑
- `prompts.py`: 提示词模板管理
- `models.py`: AI 相关的数据模型（如果需要）
- `schemas.py`: AI 相关的请求/响应模式

## 功能说明

### 1. AI 服务 (service.py)
- 封装 LangChain 的核心功能
- 提供文本生成、对话生成等接口
- 支持多种 LLM 模型

### 2. 提示词管理 (prompts.py)
- 管理预定义的提示词模板
- 支持动态变量替换
- 支持系统提示词和用户提示词

## 使用示例

```python
from app.modules.ai.service import ai_service

# 生成文本
result = ai_service.generate_text(
    prompt="请总结以下内容：{content}",
    context={"content": "这是一段长文本..."}
)

# 使用系统提示词
result = ai_service.generate_with_system_prompt(
    system_prompt="你是一个专业的文案编辑",
    user_prompt="请改写以下内容：{text}",
    context={"text": "原始文本"}
)
```
