from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Union
from app.modules.filesystem import schemas, crud, models
from app.modules.auth.models import User
from app.modules.auth.jwt import get_current_active_user
from app.modules.workflow import crud as workflow_crud
from app.core.database import get_db



router = APIRouter(prefix="/flows/{flow_id}/files", tags=["filesystem"])


def verify_flow_ownership(db: Session, flow_id: int, user_id: int):
    """验证工作流是否存在且属于当前用户"""
    flow = workflow_crud.get_flow(db, flow_id=flow_id, user_id=user_id)
    if not flow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found"
        )
    return flow


def generate_file_path(db: Session, file: models.File) -> str:
    """生成文件的路径"""
    path_parts = []
    current_file = file
    
    while current_file:
        path_parts.insert(0, current_file.name)
        current_file = current_file.parent
    
    return "/" + "/".join(path_parts)


def build_file_tree(files: List[models.File]) -> List[schemas.FileWithChildren]:
    """构建文件树结构"""
    file_map = {file.id: schemas.FileWithChildren.model_validate(file) for file in files}
    root_files = []
    
    for file_id, file in file_map.items():
        if file.parent_id is None:
            root_files.append(file)
        else:
            parent_file = file_map.get(file.parent_id)
            if parent_file:
                parent_file.children.append(file)
    
    return root_files


@router.get("", response_model=List[schemas.FileBaseResponse])
def get_files(
    flow_id: int,
    parent_id: Optional[Union[int, str]] = Query(None, description="父文件夹ID，None表示根目录"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    parsed_parent_id = None
    if parent_id is not None:
        if isinstance(parent_id, str):
            if parent_id.lower() == "none" or parent_id == "":
                parsed_parent_id = None
            else:
                try:
                    parsed_parent_id = int(parent_id)
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="parent_id must be an integer or 'none'")
        else:
            parsed_parent_id = parent_id
    
    files = crud.get_files_by_parent_id(db, parsed_parent_id, flow_id)
    # 生成文件路径
    for file in files:
        file.path = generate_file_path(db, file)
    return files


@router.get("/tree", response_model=List[schemas.FileWithChildren])
def get_file_tree(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    # 获取所有文件
    files = crud.get_all_files(db, flow_id)
    # 生成文件路径
    for file in files:
        file.path = generate_file_path(db, file)
    # 构建文件树
    file_tree = build_file_tree(files)
    return file_tree


@router.get("/all", response_model=List[schemas.FileBaseResponse])
def get_all_files(
    flow_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    files = crud.get_all_files(db, flow_id)
    # 生成文件路径
    for file in files:
        file.path = generate_file_path(db, file)
    return files


@router.get("/{file_id}", response_model=schemas.FileResponse)
def get_file(
    flow_id: int,
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    file = crud.get_file_by_id(db, file_id, flow_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    # 生成文件路径
    file.path = generate_file_path(db, file)
    return file


@router.post("", response_model=schemas.FileResponse, status_code=status.HTTP_201_CREATED)
def create_file(
    flow_id: int,
    file: schemas.FileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    # 检查同一目录下是否有同名文件/文件夹
    existing_file = crud.get_file_by_name_and_parent(
        db, file.name, file.parent_id, flow_id
    )
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File or folder with this name already exists in this directory"
        )
    
    if file.parent_id is not None:
        parent_file = crud.get_file_by_id(db, file.parent_id, flow_id)
        if not parent_file or parent_file.type != models.FileType.FOLDER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent folder not found or not a folder"
            )
    
    created_file = crud.create_file(db, file, flow_id)
    # 生成文件路径
    created_file.path = generate_file_path(db, created_file)
    return created_file


@router.put("/{file_id}", response_model=schemas.FileResponse)
def update_file(
    flow_id: int,
    file_id: int,
    file_update: schemas.FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    try:
        updated_file = crud.update_file(db, file_id, file_update, flow_id)
        if not updated_file:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found"
            )
        # 生成文件路径
        updated_file.path = generate_file_path(db, updated_file)
        return updated_file
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    flow_id: int,
    file_id: int,
    recursive: bool = Query(False, description="是否递归删除子文件/文件夹"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 验证工作流所有权
    verify_flow_ownership(db, flow_id, current_user.id)
    
    file = crud.get_file_by_id(db, file_id, flow_id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    success = crud.delete_file(db, file_id, flow_id, recursive)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
