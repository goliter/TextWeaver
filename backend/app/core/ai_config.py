from typing import Optional
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class AISettings(BaseSettings):
    """AI 服务配置"""
    
    # OpenAI API 配置
    openai_api_key: str = ""
    openai_api_base: Optional[str] = None
    openai_model: str = "gemini-2.0-flash"
    
    # LangChain 配置
    langchain_verbose: bool = False
    langchain_temperature: float = 0.7
    langchain_max_tokens: int = 2000
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False
        extra = "ignore"  # 忽略未定义的环境变量


ai_settings = AISettings()
