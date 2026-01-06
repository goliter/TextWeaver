from pydantic_settings import BaseSettings
from typing import Optional
import secrets

class Settings(BaseSettings):
    # 数据库配置
    DATABASE_URL: str = "postgresql://textweaver:password@localhost:5432/textweaver_dev"
    
    # API配置
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # JWT配置
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # 应用配置
    PROJECT_NAME: str = "TextWeaver API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    class Config:
        env_file = ".env"

# 创建配置实例
settings = Settings()