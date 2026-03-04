from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from app.modules.workflow import models, schemas


# ==================== Flow CRUD ====================

def get_flow(db: Session, flow_id: int, user_id: int) -> Optional[models.Flow]:
    """获取单个工作流"""
    return db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()


def get_flows(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Flow]:
    """获取用户的工作流列表"""
    return db.query(models.Flow).filter(
        models.Flow.user_id == user_id
    ).order_by(desc(models.Flow.created_at)).offset(skip).limit(limit).all()


def create_flow(db: Session, flow: schemas.FlowCreate, user_id: int) -> models.Flow:
    """创建工作流"""
    db_flow = models.Flow(
        name=flow.name,
        description=flow.description,
        user_id=user_id
    )
    db.add(db_flow)
    db.commit()
    db.refresh(db_flow)
    return db_flow


def update_flow(db: Session, flow_id: int, flow_update: schemas.FlowUpdate, user_id: int) -> Optional[models.Flow]:
    """更新工作流"""
    db_flow = db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not db_flow:
        return None
    
    if flow_update.name is not None:
        db_flow.name = flow_update.name
    if flow_update.description is not None:
        db_flow.description = flow_update.description
    
    db.commit()
    db.refresh(db_flow)
    return db_flow


def delete_flow(db: Session, flow_id: int, user_id: int) -> bool:
    """删除工作流"""
    db_flow = db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not db_flow:
        return False
    
    db.delete(db_flow)
    db.commit()
    return True


def duplicate_flow(db: Session, flow_id: int, user_id: int) -> Optional[models.Flow]:
    """复制工作流"""
    original_flow = db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not original_flow:
        return None
    
    # 创建新的工作流
    new_flow = models.Flow(
        name=f"{original_flow.name} (副本)",
        description=original_flow.description,
        user_id=user_id
    )
    db.add(new_flow)
    db.commit()
    db.refresh(new_flow)
    
    # 复制节点
    node_id_mapping = {}
    for node in original_flow.nodes:
        new_node = models.Node(
            flow_id=new_flow.id,
            node_type=node.node_type,
            name=node.name,
            position=node.position,
            data=node.data
        )
        db.add(new_node)
        db.commit()
        db.refresh(new_node)
        node_id_mapping[node.id] = new_node.id
    
    # 复制边
    for edge in original_flow.edges:
        if edge.source_node_id in node_id_mapping and edge.target_node_id in node_id_mapping:
            new_edge = models.Edge(
                flow_id=new_flow.id,
                source_node_id=node_id_mapping[edge.source_node_id],
                target_node_id=node_id_mapping[edge.target_node_id],
                source_handle=edge.source_handle,
                target_handle=edge.target_handle
            )
            db.add(new_edge)
    
    db.commit()
    db.refresh(new_flow)
    return new_flow


# ==================== Node CRUD ====================

def get_node(db: Session, node_id: int, flow_id: int, user_id: int) -> Optional[models.Node]:
    """获取单个节点"""
    return db.query(models.Node).join(models.Flow).filter(
        models.Node.id == node_id,
        models.Node.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).first()


def get_nodes_by_flow(db: Session, flow_id: int, user_id: int) -> List[models.Node]:
    """获取工作流的所有节点"""
    return db.query(models.Node).join(models.Flow).filter(
        models.Node.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).all()


def create_node(db: Session, node: schemas.NodeCreate, flow_id: int, user_id: int) -> Optional[models.Node]:
    """创建节点"""
    # 验证工作流存在且属于当前用户
    flow = db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not flow:
        return None
    
    db_node = models.Node(
        flow_id=flow_id,
        node_type=node.node_type,
        name=node.name,
        position=node.position.model_dump(),
        data=node.data
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node


def update_node(db: Session, node_id: int, node_update: schemas.NodeUpdate, flow_id: int, user_id: int) -> Optional[models.Node]:
    """更新节点"""
    db_node = db.query(models.Node).join(models.Flow).filter(
        models.Node.id == node_id,
        models.Node.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not db_node:
        return None
    
    if node_update.name is not None:
        db_node.name = node_update.name
    if node_update.position is not None:
        db_node.position = node_update.position.model_dump()
    if node_update.data is not None:
        db_node.data = node_update.data
    
    db.commit()
    db.refresh(db_node)
    return db_node


def delete_node(db: Session, node_id: int, flow_id: int, user_id: int) -> bool:
    """删除节点"""
    db_node = db.query(models.Node).join(models.Flow).filter(
        models.Node.id == node_id,
        models.Node.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not db_node:
        return False
    
    # 先删除所有与该节点相关的边
    db.query(models.Edge).filter(
        (models.Edge.source_node_id == node_id) | 
        (models.Edge.target_node_id == node_id)
    ).delete(synchronize_session=False)
    
    # 然后删除节点
    db.delete(db_node)
    db.commit()
    return True


# ==================== Edge CRUD ====================

def get_edge(db: Session, edge_id: int, flow_id: int, user_id: int) -> Optional[models.Edge]:
    """获取单个边"""
    return db.query(models.Edge).join(models.Flow).filter(
        models.Edge.id == edge_id,
        models.Edge.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).first()


def get_edges_by_flow(db: Session, flow_id: int, user_id: int) -> List[models.Edge]:
    """获取工作流的所有边"""
    return db.query(models.Edge).join(models.Flow).filter(
        models.Edge.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).all()


def create_edge(db: Session, edge: schemas.EdgeCreate, flow_id: int, user_id: int) -> Optional[models.Edge]:
    """创建边"""
    # 验证工作流存在且属于当前用户
    flow = db.query(models.Flow).filter(
        models.Flow.id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not flow:
        return None
    
    # 验证源节点和目标节点存在且属于该工作流
    source_node = db.query(models.Node).filter(
        models.Node.id == edge.source_node_id,
        models.Node.flow_id == flow_id
    ).first()
    
    target_node = db.query(models.Node).filter(
        models.Node.id == edge.target_node_id,
        models.Node.flow_id == flow_id
    ).first()
    
    if not source_node or not target_node:
        raise ValueError("Source or target node not found in this workflow")
    
    db_edge = models.Edge(
        flow_id=flow_id,
        source_node_id=edge.source_node_id,
        target_node_id=edge.target_node_id,
        source_handle=edge.source_handle,
        target_handle=edge.target_handle
    )
    db.add(db_edge)
    db.commit()
    db.refresh(db_edge)
    return db_edge


def delete_edge(db: Session, edge_id: int, flow_id: int, user_id: int) -> bool:
    """删除边"""
    db_edge = db.query(models.Edge).join(models.Flow).filter(
        models.Edge.id == edge_id,
        models.Edge.flow_id == flow_id,
        models.Flow.user_id == user_id
    ).first()
    
    if not db_edge:
        return False
    
    db.delete(db_edge)
    db.commit()
    return True


# ==================== Execution CRUD ====================

def get_execution(db: Session, execution_id: int, user_id: int) -> Optional[models.Execution]:
    """获取单个执行记录"""
    return db.query(models.Execution).filter(
        models.Execution.id == execution_id,
        models.Execution.user_id == user_id
    ).first()


def get_executions_by_flow(db: Session, flow_id: int, user_id: int, skip: int = 0, limit: int = 100) -> List[models.Execution]:
    """获取工作流的执行记录列表"""
    return db.query(models.Execution).filter(
        models.Execution.flow_id == flow_id,
        models.Execution.user_id == user_id
    ).order_by(desc(models.Execution.start_time)).offset(skip).limit(limit).all()


def create_execution(db: Session, flow_id: int, user_id: int) -> models.Execution:
    """创建执行记录"""
    db_execution = models.Execution(
        flow_id=flow_id,
        user_id=user_id,
        status="pending"
    )
    db.add(db_execution)
    db.commit()
    db.refresh(db_execution)
    return db_execution


def update_execution_status(db: Session, execution_id: int, status: str, error_message: Optional[str] = None) -> Optional[models.Execution]:
    """更新执行记录状态"""
    db_execution = db.query(models.Execution).filter(
        models.Execution.id == execution_id
    ).first()
    
    if not db_execution:
        return None
    
    db_execution.status = status
    if error_message:
        db_execution.error_message = error_message
    if status in ["success", "error", "cancelled"]:
        from datetime import datetime, timezone
        db_execution.end_time = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_execution)
    return db_execution


# ==================== Execution Log CRUD ====================

def create_execution_log(db: Session, execution_id: int, node_id: int) -> models.ExecutionLog:
    """创建执行日志"""
    db_log = models.ExecutionLog(
        execution_id=execution_id,
        node_id=node_id,
        status="pending"
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log


def update_execution_log(db: Session, log_id: int, status: str, 
                        input_data: Optional[dict] = None,
                        output_data: Optional[dict] = None,
                        error_message: Optional[str] = None) -> Optional[models.ExecutionLog]:
    """更新执行日志"""
    db_log = db.query(models.ExecutionLog).filter(
        models.ExecutionLog.id == log_id
    ).first()
    
    if not db_log:
        return None
    
    db_log.status = status
    if input_data is not None:
        db_log.input_data = input_data
    if output_data is not None:
        db_log.output_data = output_data
    if error_message:
        db_log.error_message = error_message
    if status in ["success", "error"]:
        from datetime import datetime, timezone
        db_log.end_time = datetime.now(timezone.utc)
    
    db.commit()
    db.refresh(db_log)
    return db_log


def get_execution_logs(db: Session, execution_id: int, user_id: int) -> List[models.ExecutionLog]:
    """获取执行日志列表"""
    return db.query(models.ExecutionLog).join(models.Execution).filter(
        models.ExecutionLog.execution_id == execution_id,
        models.Execution.user_id == user_id
    ).order_by(models.ExecutionLog.start_time).all()