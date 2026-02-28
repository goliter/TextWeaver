# TextWeaver Backend

TextWeaver的后端API服务，基于FastAPI和PostgreSQL构建，采用模块化架构设计，支持未来功能扩展。

## 项目结构

```
backend/
├── app/
│   ├── __init__.py          # 应用包初始化
│   ├── core/                # 核心功能模块
│   │   ├── __init__.py
│   │   ├── config.py        # 配置管理
│   │   └── database.py      # 数据库连接配置
│   ├── modules/             # 业务功能模块
│   │   ├── __init__.py
│   │   └── auth/            # 认证模块
│   │       ├── __init__.py
│   │       ├── models.py    # 用户模型定义
│   │       ├── schemas.py   # 数据验证和序列化
│   │       ├── crud.py      # CRUD操作函数
│   │       ├── jwt.py       # JWT认证
│   │       └── routes.py    # 认证API路由
│   └── routes/              # 路由管理
│       ├── __init__.py
│       └── main.py          # 主路由配置
├── alembic/                 # Alembic数据库迁移目录
│   ├── versions/            # 迁移版本文件
│   ├── env.py               # Alembic环境配置
│   └── script.py.mako       # 迁移脚本模板
├── alembic.ini              # Alembic配置文件
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

## 数据库迁移 (Alembic)

本项目使用Alembic进行数据库版本控制和迁移管理。

### 常用命令

```bash
# 初始化迁移环境（已完成）
# alembic init alembic

# 创建新的迁移脚本（自动检测模型变化）
alembic revision --autogenerate -m "描述迁移内容"

# 执行迁移（升级到最新版本）
alembic upgrade head

# 降级迁移（回滚到上一个版本）
alembic downgrade -1

# 查看当前版本
alembic current

# 查看迁移历史
alembic history

# 查看待执行的迁移
alembic heads
```

### 迁移工作流程

1. 修改 `app/modules/*/models.py` 中的数据库模型
2. 生成迁移脚本：`alembic revision --autogenerate -m "描述"`
3. 检查生成的迁移脚本（在 `alembic/versions/` 目录下）
4. 执行迁移：`alembic upgrade head`

### 注意事项

- 自动生成的迁移脚本可能需要手动调整，特别是涉及数据迁移时
- 生产环境迁移前请先在测试环境验证
- 迁移前建议备份数据库

## 开发说明

1. 代码修改后会自动重载（如果设置了`API_RELOAD=True`）
2. 使用`black`进行代码格式化：`black .`
3. 使用`flake8`进行代码检查：`flake8 .`
