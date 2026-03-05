from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.modules.auth.jwt import get_current_active_user
from app.modules.auth.models import User
from app.modules.workflow import crud, schemas, engine

router = APIRouter(prefix="/workflows", tags=["workflows"])


# ==================== Flow Routes ====================

@router.get("", response_model=List[schemas.FlowResponse])
def get_workflows(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取用户的工作流列表"""
    flows = crud.get_flows(db, user_id=current_user.id, skip=skip, limit=limit)
    return flows


@router.get("/{flow_id}", response_model=schemas.FlowDetailResponse)
def get_workflow(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取单个工作流详情"""
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return flow


@router.post("", response_model=schemas.FlowResponse, status_code=status.HTTP_201_CREATED)
def create_workflow(
    flow: schemas.FlowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新工作流"""
    return crud.create_flow(db, flow=flow, user_id=current_user.id)


@router.put("/{flow_id}", response_model=schemas.FlowResponse)
def update_workflow(
    flow_id: int,
    flow_update: schemas.FlowUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新工作流"""
    updated_flow = crud.update_flow(db, flow_id=flow_id, flow_update=flow_update, user_id=current_user.id)
    if not updated_flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return updated_flow


@router.delete("/{flow_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除工作流"""
    success = crud.delete_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return None


@router.post("/{flow_id}/duplicate", response_model=schemas.FlowResponse)
def duplicate_workflow(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """复制工作流"""
    new_flow = crud.duplicate_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not new_flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return new_flow


# ==================== Node Routes ====================

@router.get("/{flow_id}/nodes", response_model=List[schemas.NodeResponse])
def get_nodes(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取工作流的所有节点"""
    # 验证工作流存在
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    nodes = crud.get_nodes_by_flow(db, flow_id=flow_id, user_id=current_user.id)
    return nodes


@router.post("/{flow_id}/nodes", response_model=schemas.NodeResponse, status_code=status.HTTP_201_CREATED)
def create_node(
    flow_id: int,
    node: schemas.NodeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建节点"""
    db_node = crud.create_node(db, node=node, flow_id=flow_id, user_id=current_user.id)
    if not db_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return db_node


@router.put("/{flow_id}/nodes/{node_id}", response_model=schemas.NodeResponse)
def update_node(
    flow_id: int,
    node_id: int,
    node_update: schemas.NodeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新节点"""
    updated_node = crud.update_node(db, node_id=node_id, node_update=node_update, flow_id=flow_id, user_id=current_user.id)
    if not updated_node:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    return updated_node


@router.delete("/{flow_id}/nodes/{node_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_node(
    flow_id: int,
    node_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除节点"""
    success = crud.delete_node(db, node_id=node_id, flow_id=flow_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Node not found"
        )
    return None


# ==================== Edge Routes ====================

@router.get("/{flow_id}/edges", response_model=List[schemas.EdgeResponse])
def get_edges(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取工作流的所有边"""
    # 验证工作流存在
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    edges = crud.get_edges_by_flow(db, flow_id=flow_id, user_id=current_user.id)
    return edges


@router.post("/{flow_id}/edges", response_model=schemas.EdgeResponse, status_code=status.HTTP_201_CREATED)
def create_edge(
    flow_id: int,
    edge: schemas.EdgeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建边"""
    try:
        db_edge = crud.create_edge(db, edge=edge, flow_id=flow_id, user_id=current_user.id)
        if not db_edge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workflow not found"
            )
        return db_edge
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{flow_id}/edges/{edge_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_edge(
    flow_id: int,
    edge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除边"""
    success = crud.delete_edge(db, edge_id=edge_id, flow_id=flow_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Edge not found"
        )
    return None


# ==================== Execution Routes ====================

@router.post("/{flow_id}/execute", response_model=schemas.WorkflowExecuteResponse)
def execute_workflow(
    flow_id: int,
    execute_request: Optional[schemas.WorkflowExecuteRequest] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """执行工作流"""
    # 验证工作流存在
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    # 获取输入数据
    inputs = execute_request.inputs if execute_request else {}
    
    # 创建执行引擎并执行工作流
    execution_engine = engine.ExecutionEngine(db)
    execution = execution_engine.execute_workflow(flow_id=flow_id, user_id=current_user.id, inputs=inputs)
    
    return {
        "execution_id": execution.id,
        "status": execution.status,
        "start_time": execution.start_time
    }


# ==================== Execution History Routes ====================

@router.get("/{flow_id}/executions", response_model=List[schemas.ExecutionResponse])
def get_execution_history(
    flow_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取工作流的执行历史"""
    # 验证工作流存在
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    executions = crud.get_executions_by_flow(db, flow_id=flow_id, user_id=current_user.id, skip=skip, limit=limit)
    return executions


@router.get("/{flow_id}/executions/count", response_model=int)
def get_execution_count(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取工作流的执行记录总数"""
    # 验证工作流存在
    flow = crud.get_flow(db, flow_id=flow_id, user_id=current_user.id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    
    count = crud.get_execution_count_by_flow(db, flow_id=flow_id, user_id=current_user.id)
    return count