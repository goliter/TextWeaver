# TextWeaver Backend

TextWeaver的后端API服务，基于FastAPI和PostgreSQL构建，采用模块化架构设计，支持未来功能扩展。

## 项目结构

```
backend/
├── app/
│   ├── __init__.py          # 应用包初始化
│   ├── core/                # 核心功能模块
│   │   ├── __init__.py
│   │   └── database.py      # 数据库连接配置
│   ├── modules/             # 业务功能模块
│   │   ├── __init__.py
│   │   └── auth/            # 认证模块
│   │       ├── __init__.py
│   │       ├── models.py    # 用户模型定义
│   │       ├── schemas.py   # 数据验证和序列化
│   │       ├── crud.py      # CRUD操作函数
│   │       └── routes.py    # 认证API路由
│   └── routes/              # 路由管理
│       ├── __init__.py
│       └── main.py          # 主路由配置
├── .env                     # 环境变量配置
├── main.py                  # 应用入口文件
├── requirements.txt         # 依赖包列表
└── README.md                # 项目说明文档
```

## 目录设计说明

### 核心模块 (app/core/)
存放应用的核心功能组件，如数据库配置、配置管理、工具函数等，这些组件会被多个业务模块共享。

### 业务模块 (app/modules/)
采用模块化设计，每个业务功能（如用户、文章、评论等）都作为一个独立模块，包含：
- `models.py`: 数据库模型定义
- `schemas.py`: 数据验证和序列化
- `crud.py`: 数据库操作函数
- `routes.py`: API路由定义

### 路由管理 (app/routes/)
统一管理所有业务模块的路由，便于集中配置和维护。

## 环境要求

- Python 3.8+
- Docker (用于运行PostgreSQL数据库)

## 安装依赖

```bash
pip install -r requirements.txt
```

## 配置环境变量

在项目根目录创建`.env`文件，并配置以下环境变量：

```
# 数据库连接配置
DATABASE_URL=postgresql://textweaver:password@localhost:5432/textweaver_dev

# API配置
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=True
```

## 运行数据库

确保Docker已启动，然后在项目根目录运行：

```bash
cd ..
docker-compose up -d
```

## 运行应用

```bash
cd backend
python main.py
```

或使用uvicorn直接运行：

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## API文档

应用启动后，可以通过以下地址访问自动生成的API文档：

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 可用API端点

### 认证模块

- `POST /api/auth/register` - 用户注册
- `GET /api/auth/users` - 获取所有用户
- `GET /api/auth/users/{user_id}` - 获取单个用户

## 添加新模块

要添加新的业务模块（如文章模块），只需按照以下步骤操作：

1. 在`app/modules/`目录下创建新的模块目录：
   ```
   mkdir -p app/modules/article
   ```

2. 创建模块的核心文件：
   ```
   touch app/modules/article/__init__.py
   touch app/modules/article/models.py
   touch app/modules/article/schemas.py
   touch app/modules/article/crud.py
   touch app/modules/article/routes.py
   ```

3. 在`app/routes/main.py`中注册新模块的路由：
   ```python
   from app.modules.article.routes import router as article_router
   
   # 包含文章模块的路由
   api_router.include_router(article_router)
   ```

4. 实现模块的具体功能（模型、验证、CRUD、路由）

## 数据库操作

应用启动时会自动创建数据库表结构。

## 开发说明

1. 代码修改后会自动重载（如果设置了`API_RELOAD=True`）
2. 使用`black`进行代码格式化：`black .`
3. 使用`flake8`进行代码检查：`flake8 .`