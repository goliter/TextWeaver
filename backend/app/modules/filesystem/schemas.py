from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum


class FileType(str, Enum):
    FILE = "file"
    FOLDER = "folder"


class FileBase(BaseModel):
    name: str
    type: FileType = FileType.FILE
    content: Optional[str] = None


class FileCreate(FileBase):
    parent_id: Optional[int] = None


class FileUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    parent_id: Optional[int] = None


class FileBaseResponse(BaseModel):
    """文件列表响应模型（不包含content）"""
    id: int
    name: str
    type: FileType
    size: int
    flow_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    path: str = ""
    
    class Config:
        from_attributes = True


class FileResponse(FileBaseResponse):
    """文件详情响应模型（包含content）"""
    content: Optional[str] = None
    
    class Config:
        from_attributes = True


class FileWithChildren(FileBaseResponse):
    """文件树节点（不包含content）"""
    children: Optional[List["FileWithChildren"]] = []
    
    class Config:
        from_attributes = True


class FileWithChildrenAndContent(FileResponse):
    """文件树节点（包含content）"""
    children: Optional[List["FileWithChildrenAndContent"]] = []
    
    class Config:
        from_attributes = True


FileWithChildren.update_forward_refs()
FileWithChildrenAndContent.update_forward_refs()
