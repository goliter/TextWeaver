from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv

# 导入核心组件和路由
from app.core.database import Base, engine
from app.routes.main import api_router

# 加载环境变量
load_dotenv()

# 创建FastAPI应用
app = FastAPI(title="TextWeaver API", description="TextWeaver后端API服务")

# 设置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 创建数据库表
@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)

# 注册API路由
app.include_router(api_router)

# 根路由
@app.get("/")
def read_root():
    return {"message": "Welcome to TextWeaver API"}

# 运行应用
if __name__ == "__main__":
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    reload = os.getenv("API_RELOAD", "True").lower() in ("true", "1", "t")
    
    uvicorn.run("main:app", host=host, port=port, reload=reload)

