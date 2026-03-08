"""
模板模块 Pydantic Schema
定义模板相关的数据验证和序列化
"""

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class SharePermission(str, Enum):
    """分享权限枚举"""
    PUBLIC = "public"
    PRIVATE = "private"


# ==================== 基础 Schema ====================

class TemplateNodeBase(BaseModel):
    """模板节点基础 Schema"""
    node_type: str = Field(..., description="节点类型")
    name: str = Field(..., description="节点名称")
    position: Dict[str, float] = Field(..., description="节点位置")
    data: Dict[str, Any] = Field(default={}, description="节点数据")
    original_node_id: Optional[int] = Field(None, description="原始节点ID")


class TemplateNodeCreate(TemplateNodeBase):
    """创建模板节点请求"""
    pass


class TemplateNodeResponse(TemplateNodeBase):
    """模板节点响应"""
    id: int
    template_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateEdgeBase(BaseModel):
    """模板边基础 Schema"""
    source_node_id: int = Field(..., description="源节点ID")
    target_node_id: int = Field(..., description="目标节点ID")
    source_handle: Optional[str] = Field(None, description="源连接点")
    target_handle: Optional[str] = Field(None, description="目标连接点")
    original_edge_id: Optional[int] = Field(None, description="原始边ID")


class TemplateEdgeCreate(TemplateEdgeBase):
    """创建模板边请求"""
    pass


class TemplateEdgeResponse(TemplateEdgeBase):
    """模板边响应"""
    id: int
    template_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateFileBase(BaseModel):
    """模板文件基础 Schema"""
    name: str = Field(..., description="文件名称")
    type: str = Field(..., description="文件类型: file/folder")
    content: Optional[str] = Field(None, description="文件内容")
    size: int = Field(default=0, description="文件大小")
    parent_id: Optional[int] = Field(None, description="父文件夹ID")
    path: str = Field(..., description="文件路径")
    original_file_id: Optional[int] = Field(None, description="原始文件ID")


class TemplateFileCreate(TemplateFileBase):
    """创建模板文件请求"""
    pass


class TemplateFileResponse(TemplateFileBase):
    """模板文件响应"""
    id: int
    template_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== 模板主 Schema ====================

class WorkflowTemplateBase(BaseModel):
    """工作流模板基础 Schema"""
    name: str = Field(..., min_length=1, max_length=255, description="模板名称")
    description: Optional[str] = Field(None, description="模板描述")
    tags: Optional[List[str]] = Field(None, description="标签列表")


class WorkflowTemplateCreate(WorkflowTemplateBase):
    """创建模板请求"""
    source_flow_id: int = Field(..., description="来源工作流ID")


class WorkflowTemplateUpdate(BaseModel):
    """更新模板请求"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None)
    tags: Optional[List[str]] = Field(None)
    is_public: Optional[bool] = Field(None)


class WorkflowTemplateResponse(WorkflowTemplateBase):
    """模板响应"""
    id: int
    user_id: int
    source_flow_id: Optional[int]
    use_count: int
    share_count: int
    is_public: bool
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class WorkflowTemplateDetail(WorkflowTemplateResponse):
    """模板详情（包含节点、边、文件）"""
    nodes: List[TemplateNodeResponse] = []
    edges: List[TemplateEdgeResponse] = []
    files: List[TemplateFileResponse] = []


class WorkflowTemplateList(BaseModel):
    """模板列表项"""
    id: int
    name: str
    description: Optional[str]
    tags: Optional[List[str]]
    user_id: int
    use_count: int
    is_public: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== 模板使用 Schema ====================

class UseTemplateRequest(BaseModel):
    """使用模板创建工作流请求"""
    name: str = Field(..., min_length=1, max_length=255, description="新工作流名称")
    description: Optional[str] = Field(None, description="新工作流描述")


class UseTemplateResponse(BaseModel):
    """使用模板响应"""
    flow_id: int = Field(..., description="新创建的工作流ID")
    message: str = Field(default="工作流创建成功")


# ==================== 模板分享 Schema ====================

class TemplateShareBase(BaseModel):
    """模板分享基础 Schema"""
    permission: SharePermission = Field(default=SharePermission.PRIVATE, description="分享权限")
    expires_at: Optional[datetime] = Field(None, description="过期时间")


class TemplateShareCreate(TemplateShareBase):
    """创建分享请求"""
    pass


class TemplateShareResponse(TemplateShareBase):
    """分享响应"""
    id: int
    template_id: int
    share_token: str
    access_count: int
    created_at: datetime
    share_url: Optional[str] = Field(None, description="分享链接")

    class Config:
        from_attributes = True


class SharedTemplateResponse(BaseModel):
    """通过分享链接获取的模板响应"""
    template: WorkflowTemplateDetail
    share_info: TemplateShareResponse


# ==================== 模板市场 Schema ====================

class TemplateMarketFilter(BaseModel):
    """模板市场筛选条件"""
    keyword: Optional[str] = Field(None, description="搜索关键词")
    tags: Optional[List[str]] = Field(None, description="标签筛选")
    sort_by: str = Field(default="use_count", description="排序字段: use_count/created_at")
    sort_order: str = Field(default="desc", description="排序方式: asc/desc")


class TemplateMarketList(BaseModel):
    """模板市场列表响应"""
    templates: List[WorkflowTemplateList]
    total: int
    page: int
    page_size: int
