"""
模板模块数据库模型
定义工作流模板相关的数据模型
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, Enum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class WorkflowTemplate(Base):
    """工作流模板主表"""
    __tablename__ = "workflow_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(JSON, nullable=True)  # 标签列表 ["标签1", "标签2"]
    
    # 关联信息
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    source_flow_id = Column(Integer, ForeignKey("flows.id", ondelete="SET NULL"), nullable=True)  # 来源工作流ID
    
    # 统计信息
    use_count = Column(Integer, default=0)  # 使用次数
    
    # 状态
    is_public = Column(Boolean, default=False)  # 是否公开（分享后变为公开）
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="templates")
    nodes = relationship("TemplateNode", back_populates="template", cascade="all, delete-orphan")
    edges = relationship("TemplateEdge", back_populates="template", cascade="all, delete-orphan")
    files = relationship("TemplateFile", back_populates="template", cascade="all, delete-orphan")


class TemplateNode(Base):
    """模板节点表"""
    __tablename__ = "template_nodes"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)
    
    # 节点信息
    node_type = Column(String(50), nullable=False)  # start, end, ai, file_reader, file_writer, folder_writer
    name = Column(String(255), nullable=False)
    position = Column(JSON, nullable=False)  # {"x": 100, "y": 200}
    data = Column(JSON, nullable=False)  # 节点配置数据
    
    # 原始节点ID（用于追踪）
    original_node_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    template = relationship("WorkflowTemplate", back_populates="nodes")


class TemplateEdge(Base):
    """模板边（连接）表"""
    __tablename__ = "template_edges"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)
    
    # 连接信息
    source_node_id = Column(Integer, ForeignKey("template_nodes.id"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("template_nodes.id"), nullable=False)
    source_handle = Column(String(50), nullable=True)
    target_handle = Column(String(50), nullable=True)
    
    # 原始边ID（用于追踪）
    original_edge_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    template = relationship("WorkflowTemplate", back_populates="edges")
    source_node = relationship("TemplateNode", foreign_keys=[source_node_id])
    target_node = relationship("TemplateNode", foreign_keys=[target_node_id])


class TemplateFile(Base):
    """模板文件表"""
    __tablename__ = "template_files"

    id = Column(Integer, primary_key=True, index=True)
    template_id = Column(Integer, ForeignKey("workflow_templates.id"), nullable=False)
    
    # 文件信息
    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)  # file, folder
    content = Column(Text, nullable=True)  # 文件内容（仅文件类型）
    size = Column(Integer, default=0)
    
    # 层级结构
    parent_id = Column(Integer, ForeignKey("template_files.id"), nullable=True)
    path = Column(String(500), nullable=False)  # 完整路径
    
    # 原始文件ID（用于追踪）
    original_file_id = Column(Integer, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    template = relationship("WorkflowTemplate", back_populates="files")
    parent = relationship("TemplateFile", remote_side=[id], backref="children")
