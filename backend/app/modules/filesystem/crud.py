from sqlalchemy.orm import Session
from typing import List, Optional
from app.modules.filesystem import models, schemas


def get_file_by_id(db: Session, file_id: int, user_id: int):
    return db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == user_id
    ).first()


def get_file_by_path(db: Session, path: str, user_id: int):
    return db.query(models.File).filter(
        models.File.path == path,
        models.File.user_id == user_id
    ).first()


def get_files_by_parent_id(db: Session, parent_id: Optional[int], user_id: int) -> List[models.File]:
    query = db.query(models.File).filter(models.File.user_id == user_id)
    if parent_id is None:
        query = query.filter(models.File.parent_id.is_(None))
    else:
        query = query.filter(models.File.parent_id == parent_id)
    return query.order_by(models.File.type.desc(), models.File.name).all()


def get_all_files(db: Session, user_id: int) -> List[models.File]:
    return db.query(models.File).filter(models.File.user_id == user_id).all()


def create_file(db: Session, file: schemas.FileCreate, user_id: int) -> models.File:
    size = len(file.content) if file.content else 0
    db_file = models.File(
        name=file.name,
        type=file.type,
        path=file.path,
        content=file.content,
        size=size,
        user_id=user_id,
        parent_id=file.parent_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def update_file(db: Session, file_id: int, file_update: schemas.FileUpdate, user_id: int) -> Optional[models.File]:
    db_file = get_file_by_id(db, file_id, user_id)
    if not db_file:
        return None
    
    update_data = file_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_file, field, value)
    
    if "content" in update_data:
        db_file.size = len(update_data["content"]) if update_data["content"] else 0
    
    db.commit()
    db.refresh(db_file)
    return db_file


def delete_file(db: Session, file_id: int, user_id: int) -> bool:
    db_file = get_file_by_id(db, file_id, user_id)
    if not db_file:
        return False
    
    db.delete(db_file)
    db.commit()
    return True


def delete_files_by_parent_id(db: Session, parent_id: int, user_id: int):
    files = get_files_by_parent_id(db, parent_id, user_id)
    for file in files:
        delete_file(db, file.id, user_id)
