# 认证模块 (Auth Module)

本模块负责用户认证和授权功能，包括用户注册、登录、JWT令牌管理等。

## 数据模型

### User 模型

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 用户ID | 主键，自增 |
| email | String | 邮箱地址 | 唯一，非空，索引 |
| username | String | 用户名 | 唯一，非空，索引 |
| hashed_password | String | 加密后的密码 | 非空 |
| is_active | Boolean | 是否激活 | 默认 True |
| created_at | DateTime | 创建时间 | 自动设置 |
| updated_at | DateTime | 更新时间 | 自动更新 |

**关联关系**：
- `files`: 一对多关系，关联到 File 模型（用户拥有的文件）

## Pydantic Schema

### UserCreate
用户注册请求模型

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| email | EmailStr | 邮箱地址 | 是 |
| username | str | 用户名 | 是 |
| password | str | 密码 | 是 |

### UserResponse
用户响应模型

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 用户ID |
| email | EmailStr | 邮箱地址 |
| username | str | 用户名 |
| is_active | bool | 是否激活 |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### UserLogin
用户登录请求模型

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| username | str | 用户名或邮箱 | 是 |
| password | str | 密码 | 是 |

### Token
令牌响应模型

| 字段名 | 类型 | 说明 |
|--------|------|------|
| access_token | str | JWT访问令牌 |
| token_type | str | 令牌类型 (bearer) |
| user | UserResponse | 用户信息 |

## API 接口

### 公开接口（无需认证）

#### 1. 用户注册
```http
POST /api/auth/register
```

**请求体**：
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**响应**：`201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": null
}
```

**错误响应**：
- `400 Bad Request`: 邮箱或用户名已存在

---

#### 2. 用户登录
```http
POST /api/auth/login
```

**请求体**（form-data）：
- `username`: 用户名或邮箱
- `password`: 密码

**响应**：`200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_active": true,
    "created_at": "2026-03-01T12:00:00",
    "updated_at": null
  }
}
```

**错误响应**：
- `401 Unauthorized`: 用户名或密码错误

---

### 需要认证的接口

> 以下接口需要在请求头中添加：`Authorization: Bearer <access_token>`

#### 3. 获取当前用户信息
```http
GET /api/auth/me
```

**响应**：`200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": null
}
```

**错误响应**：
- `401 Unauthorized`: 未提供令牌或令牌无效
- `403 Forbidden`: 用户未激活

---

#### 4. 获取所有用户
```http
GET /api/auth/users?skip=0&limit=100
```

**查询参数**：
- `skip`: 跳过数量（默认0）
- `limit`: 返回数量（默认100）

**响应**：`200 OK`
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "is_active": true,
    "created_at": "2026-03-01T12:00:00",
    "updated_at": null
  }
]
```

---

#### 5. 获取单个用户
```http
GET /api/auth/users/{user_id}
```

**路径参数**：
- `user_id`: 用户ID

**响应**：`200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "is_active": true,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": null
}
```

**错误响应**：
- `404 Not Found`: 用户不存在

---

#### 6. 通过邮箱获取用户
```http
GET /api/auth/users/email/{email}
```

**路径参数**：
- `email`: 邮箱地址

**响应**：`200 OK`
（同获取单个用户）

**错误响应**：
- `404 Not Found`: 用户不存在

## 认证流程

### JWT 认证流程

1. **注册**：调用 `POST /api/auth/register` 创建账户
2. **登录**：调用 `POST /api/auth/login` 获取 access_token
3. **访问受保护接口**：在请求头中添加 `Authorization: Bearer <token>`
4. **Token 刷新**：Token 有过期时间，过期后需要重新登录

### 在 Swagger UI 中测试

1. 打开 http://127.0.0.1:8000/docs
2. 点击右上角的 **"Authorize"** 按钮
3. 输入用户名和密码
4. 点击 **"Authorize"** 完成认证
5. 现在可以测试所有需要认证的接口

## 安全说明

- 密码使用 bcrypt 算法加密存储
- JWT Token 包含用户标识和过期时间
- 所有密码验证都在服务端完成
- 支持通过用户名或邮箱登录