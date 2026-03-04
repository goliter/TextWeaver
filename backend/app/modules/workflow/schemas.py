from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class NodeType(str, Enum):
    """节点类型枚举"""
    INPUT = "input"
    OUTPUT = "output"
    START = "start"
    END = "end"
    AI = "ai"
    FILE_READER = "file_reader"
    FILE_WRITER = "file_writer"


class ExecutionStatus(str, Enum):
    """执行状态枚举"""
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    ERROR = "error"
    CANCELLED = "cancelled"


# ==================== Flow Schemas ====================

class FlowBase(BaseModel):
    """工作流基础模型"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None


class FlowCreate(FlowBase):
    """创建工作流请求模型"""
    pass


class FlowUpdate(BaseModel):
    """更新工作流请求模型"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None


class FlowResponse(FlowBase):
    """工作流响应模型"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class FlowDetailResponse(FlowResponse):
    """工作流详情响应模型（包含节点和边）"""
    nodes: List["NodeResponse"] = []
    edges: List["EdgeResponse"] = []


# ==================== Node Schemas ====================

class NodePosition(BaseModel):
    """节点位置模型"""
    x: float
    y: float


class NodeBase(BaseModel):
    """节点基础模型"""
    node_type: NodeType
    name: str = Field(..., min_length=1, max_length=255)
    position: NodePosition
    data: Dict[str, Any] = {}


class NodeCreate(NodeBase):
    """创建节点请求模型"""
    pass


class NodeUpdate(BaseModel):
    """更新节点请求模型"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    position: Optional[NodePosition] = None
    data: Optional[Dict[str, Any]] = None


class NodeResponse(NodeBase):
    """节点响应模型"""
    id: int
    flow_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Edge Schemas ====================

class EdgeBase(BaseModel):
    """边基础模型"""
    source_node_id: int
    target_node_id: int
    source_handle: Optional[str] = None
    target_handle: Optional[str] = None


class EdgeCreate(EdgeBase):
    """创建边请求模型"""
    pass


class EdgeResponse(EdgeBase):
    """边响应模型"""
    id: int
    flow_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== Execution Schemas ====================

class ExecutionBase(BaseModel):
    """执行记录基础模型"""
    flow_id: int


class ExecutionCreate(ExecutionBase):
    """创建执行记录请求模型"""
    inputs: Optional[Dict[str, Any]] = {}


class ExecutionResponse(BaseModel):
    """执行记录响应模型"""
    id: int
    flow_id: int
    user_id: int
    status: ExecutionStatus
    start_time: datetime
    end_time: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True


class ExecutionDetailResponse(ExecutionResponse):
    """执行记录详情响应模型"""
    logs: List["ExecutionLogResponse"] = []


# ==================== Execution Log Schemas ====================

class ExecutionLogBase(BaseModel):
    """执行日志基础模型"""
    node_id: int
    status: ExecutionStatus = ExecutionStatus.PENDING
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None


class ExecutionLogCreate(ExecutionLogBase):
    """创建执行日志请求模型"""
    execution_id: int


class ExecutionLogResponse(ExecutionLogBase):
    """执行日志响应模型"""
    id: int
    execution_id: int
    error_message: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================== Workflow Execute Schemas ====================

class WorkflowExecuteRequest(BaseModel):
    """执行工作流请求模型"""
    inputs: Optional[Dict[str, Any]] = {}


class WorkflowExecuteResponse(BaseModel):
    """执行工作流响应模型"""
    execution_id: int
    status: ExecutionStatus
    start_time: datetime


# ==================== AI Service Schemas ====================

class AIModel(BaseModel):
    """AI 模型信息"""
    id: str
    name: str
    description: Optional[str] = None


class ChatMessage(BaseModel):
    """聊天消息"""
    role: str  # system, user, assistant
    content: str


class ChatRequest(BaseModel):
    """聊天请求"""
    messages: List[ChatMessage]
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    """聊天响应"""
    content: str
    model: str
    usage: Optional[Dict[str, int]] = None


class CompletionRequest(BaseModel):
    """文本完成请求"""
    prompt: str
    model: str = "gpt-3.5-turbo"
    temperature: float = 0.7
    max_tokens: Optional[int] = None


class CompletionResponse(BaseModel):
    """文本完成响应"""
    text: str
    model: str
    usage: Optional[Dict[str, int]] = None


# 更新前向引用
FlowDetailResponse.update_forward_refs()
ExecutionDetailResponse.update_forward_refs()