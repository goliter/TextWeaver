from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AIServiceBase(BaseModel):
    """AI服务配置基础模型"""
    name: str = Field(..., description="服务名称")
    api_key: str = Field(..., description="API密钥")
    api_base: str = Field(..., description="API基础URL")
    model: str = Field(..., description="模型名称")
    is_default: bool = Field(False, description="是否为默认服务")


class AIServiceCreate(AIServiceBase):
    """创建AI服务配置请求模型"""
    pass


class AIServiceUpdate(BaseModel):
    """更新AI服务配置请求模型"""
    name: Optional[str] = Field(None, description="服务名称")
    api_key: Optional[str] = Field(None, description="API密钥")
    api_base: Optional[str] = Field(None, description="API基础URL")
    model: Optional[str] = Field(None, description="模型名称")
    is_default: Optional[bool] = Field(None, description="是否为默认服务")


class AIServiceResponse(AIServiceBase):
    """AI服务配置响应模型"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
