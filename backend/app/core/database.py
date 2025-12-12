from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# 获取数据库URL
DATABASE_URL = os.getenv("DATABASE_URL")

# 创建数据库引擎
engine = create_engine(DATABASE_URL)

# 创建会话本地类
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础类
Base = declarative_base()

# 获取数据库依赖
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()