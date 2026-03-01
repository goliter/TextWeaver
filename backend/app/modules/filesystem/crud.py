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


def get_file_by_name_and_parent(db: Session, name: str, parent_id: Optional[int], user_id: int):
    """检查同一目录下是否有同名文件/文件夹"""
    query = db.query(models.File).filter(
        models.File.name == name,
        models.File.user_id == user_id
    )
    if parent_id is None:
        query = query.filter(models.File.parent_id.is_(None))
    else:
        query = query.filter(models.File.parent_id == parent_id)
    return query.first()


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
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == user_id
    ).first()
    
    if not db_file:
        return None
    
    if file_update.name is not None:
        # 检查同一目录下是否有同名文件/文件夹
        existing_file = get_file_by_name_and_parent(
            db, file_update.name, db_file.parent_id, user_id
        )
        if existing_file and existing_file.id != file_id:
            raise ValueError(f"File or folder with name '{file_update.name}' already exists in this directory")
        
        db_file.name = file_update.name
    if file_update.content is not None:
        db_file.content = file_update.content
        db_file.size = len(file_update.content)
    
    db.commit()
    db.refresh(db_file)
    return db_file


def delete_file(db: Session, file_id: int, user_id: int) -> bool:
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.user_id == user_id
    ).first()
    
    if not db_file:
        return False
    
    db.delete(db_file)
    db.commit()
    return True


def delete_files_by_parent_id(db: Session, parent_id: int, user_id: int) -> int:
    """递归删除文件夹下的所有子文件/文件夹"""
    children = db.query(models.File).filter(
        models.File.parent_id == parent_id,
        models.File.user_id == user_id
    ).all()
    
    count = 0
    for child in children:
        if child.type == models.FileType.FOLDER:
            count += delete_files_by_parent_id(db, child.id, user_id)
        db.delete(child)
        count += 1
    
    db.commit()
    return count
