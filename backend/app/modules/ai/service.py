from typing import Optional, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate, ChatPromptTemplate
from langchain_core.messages import HumanMessage, SystemMessage
from app.core.ai_config import ai_settings
import logging

logger = logging.getLogger(__name__)


class LangChainService:
    """LangChain 服务类"""
    
    def __init__(self):
        """初始化 LangChain 服务"""
        self.llm = self._create_llm()
    
    def _create_llm(self):
        """创建 LLM 实例"""
        return ChatOpenAI(
            api_key=ai_settings.openai_api_key,
            base_url=ai_settings.openai_api_base,
            model=ai_settings.openai_model,
            temperature=ai_settings.langchain_temperature,
            max_tokens=ai_settings.langchain_max_tokens,
            verbose=ai_settings.langchain_verbose,
        )
    
    def create_prompt_template(self, template: str, input_variables: list) -> PromptTemplate:
        """创建提示词模板"""
        return PromptTemplate(
            template=template,
            input_variables=input_variables,
        )
    
    def create_chat_prompt_template(self, template: str, input_variables: list) -> ChatPromptTemplate:
        """创建聊天提示词模板"""
        return ChatPromptTemplate.from_template(template)
    
    def generate_text(self, prompt: str, context: Optional[Dict[str, Any]] = None) -> str:
        """生成文本
        
        Args:
            prompt: 提示词
            context: 上下文变量，用于替换提示词中的占位符
        
        Returns:
            生成的文本
        """
        prompt_template = self.create_prompt_template(prompt, list(context.keys()) if context else [])
        
        if context:
            formatted_prompt = prompt_template.format(**context)
        else:
            formatted_prompt = prompt
        
        messages = [HumanMessage(content=formatted_prompt)]
        response = self.llm.invoke(messages)  # 使用 invoke 方法替代直接调用
        return response.content
    
    def generate_with_system_prompt(
        self, 
        system_prompt: str, 
        user_prompt: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """使用系统提示词和用户提示词生成文本
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            context: 上下文变量
        
        Returns:
            生成的文本
        """
        messages = [SystemMessage(content=system_prompt)]
        
        if context:
            prompt_template = self.create_prompt_template(user_prompt, list(context.keys()))
            formatted_user_prompt = prompt_template.format(**context)
        else:
            formatted_user_prompt = user_prompt
        
        messages.append(HumanMessage(content=formatted_user_prompt))
        
        response = self.llm.invoke(messages)  # 使用 invoke 方法替代直接调用
        return response.content


# 全局 LangChain 服务实例
langchain_service = LangChainService()
