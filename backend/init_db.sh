#!/bin/bash

echo "🔄 开始数据库初始化..."

# 等待 PostgreSQL 启动
echo "⏳ 等待 PostgreSQL 启动..."
while ! pg_isready -U textweaver -d textweaver_dev; do
  sleep 2
done
echo "✅ PostgreSQL 已启动"

# 执行数据库迁移
echo "📦 执行数据库迁移..."
cd /app
alembic upgrade head

# 执行种子操作
echo "🌱 执行种子操作..."
python seed.py

echo "✅ 数据库初始化完成！"
