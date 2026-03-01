from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class FileType(str, enum.Enum):
    FILE = "file"
    FOLDER = "folder"


class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    type = Column(Enum(FileType), nullable=False, default=FileType.FILE)
    path = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=True)
    size = Column(Integer, default=0)
    
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="files")
    parent = relationship("File", remote_side=[id], backref="children")
