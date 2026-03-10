from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Flow(Base):
    """工作流模型"""
    __tablename__ = "flows"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    user = relationship("User", back_populates="flows")
    nodes = relationship("Node", back_populates="flow", cascade="all, delete-orphan")
    edges = relationship("Edge", back_populates="flow", cascade="all, delete-orphan")
    executions = relationship("Execution", back_populates="flow", cascade="all, delete-orphan")
    files = relationship("File", back_populates="flow", cascade="all, delete-orphan")


class Node(Base):
    """工作流节点模型"""
    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    node_type = Column(String(50), nullable=False)  # input, output, ai, file_reader, file_writer
    name = Column(String(255), nullable=False)
    position = Column(JSON, nullable=False)  # {"x": 100, "y": 200}
    data = Column(JSON, nullable=False)  # 节点配置数据
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # 关系
    flow = relationship("Flow", back_populates="nodes")
    execution_logs = relationship("ExecutionLog", back_populates="node")


class Edge(Base):
    """工作流边模型（连接）"""
    __tablename__ = "edges"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    source_node_id = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(Integer, ForeignKey("nodes.id", ondelete="CASCADE"), nullable=False)
    source_handle = Column(String(50), nullable=True)
    target_handle = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # 关系
    flow = relationship("Flow", back_populates="edges")


class Execution(Base):
    """工作流执行记录模型"""
    __tablename__ = "executions"

    id = Column(Integer, primary_key=True, index=True)
    flow_id = Column(Integer, ForeignKey("flows.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, running, success, error
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    error_message = Column(Text, nullable=True)

    # 关系
    flow = relationship("Flow", back_populates="executions")
    logs = relationship("ExecutionLog", back_populates="execution", cascade="all, delete-orphan")


class ExecutionLog(Base):
    """工作流执行日志模型"""
    __tablename__ = "execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    execution_id = Column(Integer, ForeignKey("executions.id"), nullable=False)
    node_id = Column(Integer, ForeignKey("nodes.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(20), nullable=False, default="pending")  # pending, running, success, error
    input_data = Column(JSON, nullable=True)
    output_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)

    # 关系
    execution = relationship("Execution", back_populates="logs")
    node = relationship("Node", back_populates="execution_logs")