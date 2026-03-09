from typing import List, Optional
from sqlalchemy.orm import Session
from app.modules.ai.models import AIService
from app.modules.ai.schemas import AIServiceCreate, AIServiceUpdate


def get_ai_services(db: Session, user_id: int) -> List[AIService]:
    """获取用户的所有AI服务配置"""
    return db.query(AIService).filter(AIService.user_id == user_id).all()


def get_ai_service(db: Session, service_id: int, user_id: int) -> Optional[AIService]:
    """获取指定的AI服务配置"""
    return db.query(AIService).filter(
        AIService.id == service_id,
        AIService.user_id == user_id
    ).first()


def get_default_ai_service(db: Session, user_id: int) -> Optional[AIService]:
    """获取用户的默认AI服务配置"""
    return db.query(AIService).filter(
        AIService.user_id == user_id,
        AIService.is_default == True
    ).first()


def create_ai_service(db: Session, service: AIServiceCreate, user_id: int) -> AIService:
    """创建AI服务配置"""
    # 如果设置为默认服务，先将其他服务设置为非默认
    if service.is_default:
        db.query(AIService).filter(
            AIService.user_id == user_id,
            AIService.is_default == True
        ).update({"is_default": False})
    
    db_service = AIService(
        **service.model_dump(),
        user_id=user_id
    )
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service


def update_ai_service(db: Session, service_id: int, service_update: AIServiceUpdate, user_id: int) -> Optional[AIService]:
    """更新AI服务配置"""
    db_service = get_ai_service(db, service_id, user_id)
    if not db_service:
        return None
    
    # 如果设置为默认服务，先将其他服务设置为非默认
    if service_update.is_default:
        db.query(AIService).filter(
            AIService.user_id == user_id,
            AIService.is_default == True
        ).update({"is_default": False})
    
    # 更新服务配置
    update_data = service_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_service, field, value)
    
    db.commit()
    db.refresh(db_service)
    return db_service


def delete_ai_service(db: Session, service_id: int, user_id: int) -> bool:
    """删除AI服务配置"""
    db_service = get_ai_service(db, service_id, user_id)
    if not db_service:
        return False
    
    db.delete(db_service)
    db.commit()
    return True


def set_default_ai_service(db: Session, service_id: int, user_id: int) -> Optional[AIService]:
    """设置默认AI服务配置"""
    # 先将所有服务设置为非默认
    db.query(AIService).filter(
        AIService.user_id == user_id,
        AIService.is_default == True
    ).update({"is_default": False})
    
    # 将指定服务设置为默认
    db_service = get_ai_service(db, service_id, user_id)
    if not db_service:
        return None
    
    db_service.is_default = True
    db.commit()
    db.refresh(db_service)
    return db_service
