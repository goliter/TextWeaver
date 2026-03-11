# TextWeaver v1.0 Docker 部署指南

## 简介

本指南详细介绍如何使用 Docker 部署 TextWeaver v1.0 AI 文本工作流平台。通过 Docker 部署，可以确保环境一致性，简化部署过程，并便于在不同服务器上快速迁移。

## 前提条件

- **Docker**：确保服务器已安装 Docker 19.03+ 版本
- **Docker Compose**：确保已安装 Docker Compose 1.27+ 版本
- **服务器资源**：建议至少 2GB 内存，1 CPU 核心，10GB 存储空间
- **网络**：服务器需要能够访问外部网络（用于拉取依赖和 AI 服务调用）

## 项目结构准备

### 1. 项目目录结构

确保项目目录结构如下：

```
TextWeaver/
├── frontend/         # 前端代码
├── backend/          # 后端代码
├── docker-compose.yml    # Docker Compose 配置文件
├── .env.example     # 环境变量示例文件
└── README.md        # 项目说明文档
```

### 2. 创建 Docker 相关文件

#### 2.1 前端 Dockerfile

在 `frontend` 目录中创建 `Dockerfile` 文件：

```dockerfile
# 前端构建阶段
FROM node:18-alpine AS build

WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制前端代码
COPY . .

# 构建生产版本
RUN npm run build

# 前端运行阶段
FROM nginx:alpine

# 复制构建产物到 Nginx 静态目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.2 前端 Nginx 配置

在 `frontend` 目录中创建 `nginx.conf` 文件：

```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 代理 API 请求到后端服务
    location /api {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 2.3 后端 Dockerfile

在 `backend` 目录中创建 `Dockerfile` 文件：

```dockerfile
# 后端构建阶段
FROM python:3.11-slim AS build

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制 requirements.txt
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY . .

# 后端运行阶段
FROM python:3.11-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖和代码
COPY --from=build /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=build /app/ /app/

# 暴露端口
EXPOSE 8000

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 启动后端服务
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2.4 Docker Compose 配置

在项目根目录 `TextWeaver` 中创建 `docker-compose.yml` 文件：

```yaml
version: "3.8"

services:
  # PostgreSQL 数据库
  db:
    image: postgres:15-alpine
    container_name: textweaver-db
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # 后端服务
  backend:
    build:
      context: ./backend
    container_name: textweaver-backend
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}
      SECRET_KEY: ${SECRET_KEY}
      AI_API_KEY: ${AI_API_KEY}
    depends_on:
      - db
    restart: unless-stopped

  # 前端服务
  frontend:
    build:
      context: ./frontend
    container_name: textweaver-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

#### 2.5 环境变量配置

在项目根目录 `TextWeaver` 中创建 `.env` 文件，参考 `.env.example`：

```env
# 数据库配置
POSTGRES_DB=textweaver
POSTGRES_USER=admin
POSTGRES_PASSWORD=your_secure_password

# 后端配置
SECRET_KEY=your_secret_key_here

# AI 服务配置
AI_API_KEY=your_ai_api_key_here
```

## 部署步骤

### 1. 准备代码

确保前端和后端代码已准备就绪，所有依赖已正确配置。

### 2. 构建和启动容器

在 `TextWeaver` 目录中执行以下命令：

```bash
# 构建并启动容器
docker-compose up -d --build

# 查看容器状态
docker-compose ps
```

### 3. 初始化数据库

首次部署时，需要初始化数据库并运行迁移：

```bash
# 进入后端容器
docker exec -it textweaver-backend bash

# 运行数据库迁移
python -m alembic upgrade head

# 退出容器
exit
```

### 4. 验证部署

部署完成后，通过以下步骤验证服务是否正常运行：

1. **访问前端**：在浏览器中访问 `http://服务器IP`，应该能看到 TextWeaver 登录页面
2. **检查后端 API**：访问 `http://服务器IP/api/health`，应该返回健康状态
3. **检查数据库**：通过 PostgreSQL 客户端连接数据库，验证表结构是否创建成功

## 配置与优化

### 1. 环境变量配置

根据实际部署环境，修改 `.env` 文件中的配置：

- **数据库配置**：设置安全的数据库密码
- **SECRET_KEY**：设置一个随机的密钥，用于 JWT 签名
- **AI_API_KEY**：设置实际的 AI 服务 API 密钥

### 2. 性能优化

- **资源限制**：在 `docker-compose.yml` 中为容器设置资源限制
- **Nginx 优化**：调整 Nginx 配置，提高静态文件服务性能
- **数据库优化**：根据实际负载调整 PostgreSQL 配置

### 3. 安全配置

- **HTTPS**：配置 SSL 证书，启用 HTTPS
- **防火墙**：配置服务器防火墙，只开放必要的端口
- **环境变量**：不要在代码中硬编码敏感信息
- **定期更新**：定期更新 Docker 镜像和依赖包

## 维护与管理

### 1. 查看日志

```bash
# 查看前端日志
docker logs textweaver-frontend

# 查看后端日志
docker logs textweaver-backend

# 查看数据库日志
docker logs textweaver-db
```

### 2. 停止和重启服务

```bash
# 停止服务
docker-compose down

# 启动服务
docker-compose up -d

# 重启服务
docker-compose restart
```

### 3. 更新代码

```bash
# 停止服务
docker-compose down

# 更新代码（例如 git pull）

# 重新构建并启动服务
docker-compose up -d --build

# 运行数据库迁移（如果有数据库变更）
docker exec -it textweaver-backend alembic upgrade head
```

### 4. 数据备份

```bash
# 备份数据库
docker exec -t textweaver-db pg_dump -U admin textweaver > backup.sql

# 恢复数据库
docker exec -i textweaver-db psql -U admin textweaver < backup.sql
```

## 常见问题与解决方案

### 1. 容器启动失败

**症状**：`docker-compose ps` 显示容器状态为 `Exited`

**解决方案**：

- 查看容器日志：`docker logs 容器名称`
- 检查环境变量配置
- 检查端口是否被占用

### 2. 前端无法连接后端

**症状**：前端页面显示 API 连接错误

**解决方案**：

- 检查后端服务是否正常运行
- 检查 Nginx 配置中的代理设置
- 检查网络连接

### 3. 数据库连接失败

**症状**：后端日志显示数据库连接错误

**解决方案**：

- 检查数据库容器是否正常运行
- 检查数据库配置和密码
- 检查网络连接

### 4. AI 服务调用失败

**症状**：AI 节点执行失败，显示 API 调用错误

**解决方案**：

- 检查 AI API 密钥是否正确
- 检查网络连接是否能够访问 AI 服务
- 检查 AI 服务的使用限制

## 扩展部署

### 1. 多服务器部署

对于生产环境，可以使用 Docker Swarm 或 Kubernetes 进行多服务器部署：

- **Docker Swarm**：使用 `docker stack deploy` 命令部署
- **Kubernetes**：创建 Kubernetes 配置文件，使用 `kubectl` 部署

### 2. 负载均衡

当用户量增加时，可以添加负载均衡器：

- **Nginx 负载均衡**：配置 Nginx 作为前端和后端的负载均衡器
- **Docker Compose 扩展**：在 `docker-compose.yml` 中使用 `scale` 命令扩展服务

### 3. 监控与告警

添加监控和告警系统：

- **Prometheus**：监控容器和服务状态
- **Grafana**：可视化监控数据
- **Alertmanager**：设置告警规则

## 总结

通过 Docker 部署 TextWeaver v1.0，可以实现快速、一致的部署过程，确保环境的稳定性和可重复性。本指南提供了详细的部署步骤和常见问题解决方案，帮助您顺利部署和维护 TextWeaver 平台。

---

**注意**：本部署指南适用于 TextWeaver v1.0 版本，后续版本可能需要调整部署步骤。
