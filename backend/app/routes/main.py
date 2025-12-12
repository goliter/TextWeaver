from fastapi import APIRouter

# 导入各个模块的路由
from app.modules.auth.routes import router as auth_router

# 创建主路由器
api_router = APIRouter(prefix="/api")

# 包含各个模块的路由
api_router.include_router(auth_router)

# 未来可以在此添加更多模块路由
# api_router.include_router(another_module_router)