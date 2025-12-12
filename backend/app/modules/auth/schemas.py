from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

# 用户创建请求模型
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str

# 用户响应模型
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 用户登录请求模型
class UserLogin(BaseModel):
    email: EmailStr
    password: str