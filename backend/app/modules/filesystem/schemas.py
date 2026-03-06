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


class FileResponse(BaseModel):
    id: int
    name: str
    type: FileType
    content: Optional[str] = None
    size: int
    flow_id: int
    parent_id: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class FileWithChildren(FileResponse):
    children: Optional[List["FileWithChildren"]] = []
    
    class Config:
        from_attributes = True


FileWithChildren.update_forward_refs()
