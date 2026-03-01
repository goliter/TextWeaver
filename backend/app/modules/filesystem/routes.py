from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional, List, Union
from app.modules.filesystem import schemas, crud, models
from app.modules.auth.models import User
from app.modules.auth.jwt import get_current_active_user
from app.core.database import get_db



router = APIRouter(prefix="/filesystem", tags=["filesystem"])


@router.get("/files", response_model=List[schemas.FileResponse])
def get_files(
    parent_id: Optional[Union[int, str]] = Query(None, description="父文件夹ID，None表示根目录"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
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
                        detail="parent_id must be an integer or 'none'"
                    )
        else:
            parsed_parent_id = parent_id
    
    files = crud.get_files_by_parent_id(db, parsed_parent_id, current_user.id)
    return files


@router.get("/files/all", response_model=List[schemas.FileResponse])
def get_all_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    files = crud.get_all_files(db, current_user.id)
    return files


@router.get("/files/{file_id}", response_model=schemas.FileResponse)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    file = crud.get_file_by_id(db, file_id, current_user.id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    return file


@router.get("/files/path/{path:path}", response_model=schemas.FileResponse)
def get_file_by_path(
    path: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    file = crud.get_file_by_path(db, path, current_user.id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    return file


@router.post("/files", response_model=schemas.FileResponse, status_code=status.HTTP_201_CREATED)
def create_file(
    file: schemas.FileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    existing_file = crud.get_file_by_path(db, file.path, current_user.id)
    if existing_file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File with this path already exists"
        )
    
    if file.parent_id is not None:
        parent_file = crud.get_file_by_id(db, file.parent_id, current_user.id)
        if not parent_file or parent_file.type != models.FileType.FOLDER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent folder not found or not a folder"
            )
    
    return crud.create_file(db, file, current_user.id)


@router.put("/files/{file_id}", response_model=schemas.FileResponse)
def update_file(
    file_id: int,
    file_update: schemas.FileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    updated_file = crud.update_file(db, file_id, file_update, current_user.id)
    if not updated_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    return updated_file


@router.delete("/files/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    recursive: bool = Query(False, description="是否递归删除子文件/文件夹"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    file = crud.get_file_by_id(db, file_id, current_user.id)
    if not file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    if recursive and file.type == models.FileType.FOLDER:
        crud.delete_files_by_parent_id(db, file_id, current_user.id)
    
    success = crud.delete_file(db, file_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
