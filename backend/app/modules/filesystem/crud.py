from sqlalchemy.orm import Session
from typing import List, Optional
from app.modules.filesystem import models, schemas


def get_file_by_id(db: Session, file_id: int, flow_id: int):
    return db.query(models.File).filter(
        models.File.id == file_id,
        models.File.flow_id == flow_id
    ).first()


def get_file_by_name_and_parent(db: Session, name: str, parent_id: Optional[int], flow_id: int):
    """检查同一目录下是否有同名文件/文件夹"""
    query = db.query(models.File).filter(
        models.File.name == name,
        models.File.flow_id == flow_id
    )
    if parent_id is None:
        query = query.filter(models.File.parent_id.is_(None))
    else:
        query = query.filter(models.File.parent_id == parent_id)
    return query.first()


def get_files_by_parent_id(db: Session, parent_id: Optional[int], flow_id: int) -> List[models.File]:
    query = db.query(models.File).filter(models.File.flow_id == flow_id)
    if parent_id is None:
        query = query.filter(models.File.parent_id.is_(None))
    else:
        query = query.filter(models.File.parent_id == parent_id)
    return query.order_by(models.File.type.desc(), models.File.name).all()


def get_all_files(db: Session, flow_id: int) -> List[models.File]:
    return db.query(models.File).filter(models.File.flow_id == flow_id).all()


def create_file(db: Session, file: schemas.FileCreate, flow_id: int) -> models.File:
    size = len(file.content) if file.content else 0
    db_file = models.File(
        name=file.name,
        type=file.type,
        content=file.content,
        size=size,
        flow_id=flow_id,
        parent_id=file.parent_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def create_root_folder(db: Session, flow_id: int, flow_name: str) -> models.File:
    """为新工作流创建根目录"""
    # 检查是否已存在根目录
    existing_root = db.query(models.File).filter(
        models.File.flow_id == flow_id,
        models.File.parent_id.is_(None),
        models.File.type == models.FileType.FOLDER
    ).first()
    
    if existing_root:
        return existing_root
    
    # 创建根目录，使用工作流名称作为文件夹名称
    db_file = models.File(
        name=flow_name,
        type=models.FileType.FOLDER,
        content=None,
        size=0,
        flow_id=flow_id,
        parent_id=None
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file


def update_file(db: Session, file_id: int, file_update: schemas.FileUpdate, flow_id: int) -> Optional[models.File]:
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.flow_id == flow_id
    ).first()
    
    if not db_file:
        return None
    
    if file_update.name is not None:
        # 检查同一目录下是否有同名文件/文件夹
        existing_file = get_file_by_name_and_parent(
            db, file_update.name, file_update.parent_id if file_update.parent_id is not None else db_file.parent_id, flow_id
        )
        if existing_file and existing_file.id != file_id:
            raise ValueError(f"File or folder with name '{file_update.name}' already exists in this directory")
        
        db_file.name = file_update.name
    
    if file_update.content is not None:
        db_file.content = file_update.content
        db_file.size = len(file_update.content)
    
    if file_update.parent_id is not None:
        # 检查目标文件夹是否存在
        target_folder = db.query(models.File).filter(
            models.File.id == file_update.parent_id,
            models.File.flow_id == flow_id,
            models.File.type == models.FileType.FOLDER
        ).first()
        
        if not target_folder:
            raise ValueError("Target folder does not exist")
        
        # 检查是否会导致循环依赖
        if file_update.parent_id == file_id:
            raise ValueError("Cannot move a file/folder into itself")
        
        # 检查目标文件夹是否是当前文件的子文件夹
        current_file = target_folder
        while current_file.parent_id is not None:
            if current_file.parent_id == file_id:
                raise ValueError("Cannot move a file/folder into its own subfolder")
            current_file = db.query(models.File).filter(
                models.File.id == current_file.parent_id,
                models.File.flow_id == flow_id
            ).first()
        
        # 检查目标文件夹中是否有同名文件/文件夹
        existing_file = get_file_by_name_and_parent(
            db, db_file.name, file_update.parent_id, flow_id
        )
        if existing_file and existing_file.id != file_id:
            raise ValueError(f"File or folder with name '{db_file.name}' already exists in the target directory")
        
        db_file.parent_id = file_update.parent_id
    
    db.commit()
    db.refresh(db_file)
    return db_file


def delete_file(db: Session, file_id: int, flow_id: int) -> bool:
    db_file = db.query(models.File).filter(
        models.File.id == file_id,
        models.File.flow_id == flow_id
    ).first()
    
    if not db_file:
        return False
    
    db.delete(db_file)
    db.commit()
    return True


def delete_files_by_parent_id(db: Session, parent_id: int, flow_id: int) -> int:
    """递归删除文件夹下的所有子文件/文件夹"""
    children = db.query(models.File).filter(
        models.File.parent_id == parent_id,
        models.File.flow_id == flow_id
    ).all()
    
    count = 0
    for child in children:
        if child.type == models.FileType.FOLDER:
            count += delete_files_by_parent_id(db, child.id, flow_id)
        db.delete(child)
        count += 1
    
    db.commit()
    return count
