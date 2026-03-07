"""
文件服务模块
提供文件读取和写入功能，支持虚拟文件系统
"""

from typing import Optional
from sqlalchemy.orm import Session
from app.modules.filesystem import crud as filesystem_crud
from app.modules.filesystem.models import File


class FileService:
    """文件服务类"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def read_file(self, file_id: int, encoding: str = "utf-8") -> str:
        """
        读取文件内容
        
        Args:
            file_id: 文件ID
            encoding: 文件编码，默认为utf-8
        
        Returns:
            文件内容字符串
        
        Raises:
            ValueError: 如果文件不存在或不是文件类型
        """
        file = self.db.query(File).filter(File.id == file_id).first()
        
        if not file:
            raise ValueError(f"文件不存在: ID={file_id}")
        
        if file.type != "file":
            raise ValueError(f"不是文件类型: ID={file_id}, type={file.type}")
        
        content = file.content or ""
        
        # 如果需要，进行编码转换
        if encoding != "utf-8":
            try:
                content = content.encode('utf-8').decode(encoding)
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                raise ValueError(f"编码转换失败: {e}")
        
        return content
    
    def write_file(
        self,
        file_id: int,
        content: str,
        encoding: str = "utf-8",
        overwrite: bool = True
    ) -> None:
        """
        写入文件内容
        
        Args:
            file_id: 文件ID
            content: 要写入的内容
            encoding: 文件编码，默认为utf-8
            overwrite: 是否覆盖原文件，默认为True
        
        Raises:
            ValueError: 如果文件不存在、不是文件类型或不允许覆盖
        """
        file = self.db.query(File).filter(File.id == file_id).first()
        
        if not file:
            raise ValueError(f"文件不存在: ID={file_id}")
        
        if file.type != "file":
            raise ValueError(f"不是文件类型: ID={file_id}, type={file.type}")
        
        # 检查是否允许覆盖
        if not overwrite and file.content:
            raise ValueError(f"文件已存在且不允许覆盖: ID={file_id}")
        
        # 如果需要，进行编码转换
        if encoding != "utf-8":
            try:
                content = content.encode(encoding).decode('utf-8')
            except (UnicodeEncodeError, UnicodeDecodeError) as e:
                raise ValueError(f"编码转换失败: {e}")
        
        # 更新文件内容
        file.content = content
        self.db.commit()
        self.db.refresh(file)
    
    def get_file_info(self, file_id: int) -> dict:
        """
        获取文件信息
        
        Args:
            file_id: 文件ID
        
        Returns:
            文件信息字典
        
        Raises:
            ValueError: 如果文件不存在
        """
        file = self.db.query(File).filter(File.id == file_id).first()
        
        if not file:
            raise ValueError(f"文件不存在: ID={file_id}")
        
        return {
            "id": file.id,
            "name": file.name,
            "type": file.type,
            "path": file.path,
            "size": file.size,
            "created_at": file.created_at.isoformat() if file.created_at else None,
            "updated_at": file.updated_at.isoformat() if file.updated_at else None,
        }
    
    def file_exists(self, file_id: int) -> bool:
        """
        检查文件是否存在
        
        Args:
            file_id: 文件ID
        
        Returns:
            文件是否存在
        """
        file = self.db.query(File).filter(File.id == file_id).first()
        return file is not None


def get_file_service(db: Session) -> FileService:
    """
    获取文件服务实例
    
    Args:
        db: 数据库会话
    
    Returns:
        文件服务实例
    """
    return FileService(db)
