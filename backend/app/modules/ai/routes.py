from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.modules.auth.jwt import get_current_active_user
from app.modules.auth.models import User
from app.modules.ai import crud, schemas

router = APIRouter(prefix="/ai-services", tags=["ai-services"])


@router.get("", response_model=List[schemas.AIServiceResponse])
def get_ai_services(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取当前用户的所有AI服务配置"""
    services = crud.get_ai_services(db, current_user.id)
    return services


@router.post("", response_model=schemas.AIServiceResponse, status_code=status.HTTP_201_CREATED)
def create_ai_service(
    service: schemas.AIServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """创建新的AI服务配置"""
    return crud.create_ai_service(db, service, current_user.id)


@router.get("/{service_id}", response_model=schemas.AIServiceResponse)
def get_ai_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """获取指定的AI服务配置"""
    service = crud.get_ai_service(db, service_id, current_user.id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI服务配置不存在"
        )
    return service


@router.put("/{service_id}", response_model=schemas.AIServiceResponse)
def update_ai_service(
    service_id: int,
    service_update: schemas.AIServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """更新AI服务配置"""
    service = crud.update_ai_service(db, service_id, service_update, current_user.id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI服务配置不存在"
        )
    return service


@router.delete("/{service_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ai_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """删除AI服务配置"""
    success = crud.delete_ai_service(db, service_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI服务配置不存在"
        )
    return None


@router.put("/{service_id}/default", response_model=schemas.AIServiceResponse)
def set_default_ai_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """设置默认AI服务配置"""
    service = crud.set_default_ai_service(db, service_id, current_user.id)
    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI服务配置不存在"
        )
    return service
