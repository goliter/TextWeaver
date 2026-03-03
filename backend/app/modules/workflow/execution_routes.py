from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.modules.auth.jwt import get_current_active_user
from app.modules.auth.models import User
from app.modules.workflow import crud, schemas

router = APIRouter(prefix="/executions", tags=["executions"])


@router.get("/{execution_id}", response_model=schemas.ExecutionDetailResponse)
def get_execution(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取执行详情"""
    execution = crud.get_execution(db, execution_id=execution_id, user_id=current_user.id)
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    return execution


@router.get("/{execution_id}/logs", response_model=List[schemas.ExecutionLogResponse])
def get_execution_logs(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取执行日志"""
    # 验证执行记录存在且属于当前用户
    execution = crud.get_execution(db, execution_id=execution_id, user_id=current_user.id)
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    logs = crud.get_execution_logs(db, execution_id=execution_id, user_id=current_user.id)
    return logs


@router.post("/{execution_id}/cancel", response_model=schemas.ExecutionResponse)
def cancel_execution(
    execution_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """取消执行"""
    # 验证执行记录存在且属于当前用户
    execution = crud.get_execution(db, execution_id=execution_id, user_id=current_user.id)
    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found"
        )
    
    # 只能取消 pending 或 running 状态的执行
    if execution.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel execution with status: {execution.status}"
        )
    
    updated_execution = crud.update_execution_status(db, execution_id=execution_id, status="cancelled")
    if not updated_execution:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel execution"
        )
    
    return updated_execution