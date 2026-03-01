# 文件系统模块 (Filesystem Module)

本模块提供虚拟文件系统功能，支持文件和文件夹的创建、读取、更新、删除操作，以及层级目录结构管理。

## 数据模型

### FileType 枚举

| 值 | 说明 |
|----|------|
| file | 文件 |
| folder | 文件夹 |

### File 模型

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | Integer | 文件ID | 主键，自增，索引 |
| name | String | 文件名 | 非空，索引 |
| type | Enum(FileType) | 类型（file/folder） | 非空，默认 file |
| path | String | 文件路径 | 非空，索引 |
| content | Text | 文件内容 | 可为空（文件夹为空） |
| size | Integer | 文件大小（字节） | 默认 0 |
| user_id | Integer | 所属用户ID | 外键 -> users.id，非空 |
| parent_id | Integer | 父文件夹ID | 外键 -> files.id，可为空（根目录） |
| created_at | DateTime | 创建时间 | 自动设置 |
| updated_at | DateTime | 更新时间 | 自动更新 |

**关联关系**：
- `user`: 多对一关系，关联到 User 模型（文件所有者）
- `parent`: 自引用关系，指向父文件夹
- `children`: 自引用关系，子文件/文件夹列表

**索引**：
- `ix_files_id`: id 字段索引
- `ix_files_name`: name 字段索引
- `ix_files_path`: path 字段索引

## Pydantic Schema

### FileType
文件类型枚举

| 值 | 说明 |
|----|------|
| file | 文件 |
| folder | 文件夹 |

### FileBase
文件基础模型

| 字段名 | 类型 | 说明 | 必填 | 默认值 |
|--------|------|------|------|--------|
| name | str | 文件名 | 是 | - |
| type | FileType | 类型 | 否 | FileType.FILE |
| path | str | 文件路径 | 是 | - |
| content | str | 文件内容 | 否 | None |

### FileCreate
创建文件请求模型（继承 FileBase）

| 字段名 | 类型 | 说明 | 必填 | 默认值 |
|--------|------|------|------|--------|
| parent_id | int | 父文件夹ID | 否 | None（根目录） |

### FileUpdate
更新文件请求模型

| 字段名 | 类型 | 说明 | 必填 |
|--------|------|------|------|
| name | str | 新文件名 | 否 |
| content | str | 新内容 | 否 |

### FileResponse
文件响应模型

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | int | 文件ID |
| name | str | 文件名 |
| type | FileType | 类型 |
| path | str | 文件路径 |
| content | str | 文件内容（文件夹为null） |
| size | int | 文件大小 |
| user_id | int | 所属用户ID |
| parent_id | int | 父文件夹ID |
| created_at | datetime | 创建时间 |
| updated_at | datetime | 更新时间 |

### FileWithChildren
带子文件的响应模型（继承 FileResponse）

| 字段名 | 类型 | 说明 |
|--------|------|------|
| children | List[FileWithChildren] | 子文件/文件夹列表 |

## API 接口

> **注意**：所有接口都需要认证，请在请求头中添加 `Authorization: Bearer <access_token>`

### 1. 获取文件列表（按父文件夹）
```http
GET /api/filesystem/files?parent_id={parent_id}
```

**查询参数**：
- `parent_id`: 父文件夹ID（可选）
  - 不传或传 `None`/`none`/空字符串：获取根目录文件
  - 传整数ID：获取指定文件夹下的文件

**响应**：`200 OK`
```json
[
  {
    "id": 1,
    "name": "documents",
    "type": "folder",
    "path": "/documents",
    "size": 0,
    "user_id": 1,
    "parent_id": null,
    "created_at": "2026-03-01T12:00:00",
    "updated_at": null
  },
  {
    "id": 2,
    "name": "readme.txt",
    "type": "file",
    "path": "/readme.txt",
    "size": 1024,
    "user_id": 1,
    "parent_id": null,
    "created_at": "2026-03-01T12:00:00",
    "updated_at": null
  }
]
```

**说明**：返回的文件按类型排序（文件夹在前）和名称排序

---

### 2. 获取所有文件
```http
GET /api/filesystem/files/all
```

**响应**：`200 OK`
```json
[
  {
    "id": 1,
    "name": "documents",
    "type": "folder",
    "path": "/documents",
    "size": 0,
    "user_id": 1,
    "parent_id": null,
    "created_at": "2026-03-01T12:00:00",
    "updated_at": null
  }
]
```

---

### 3. 获取单个文件
```http
GET /api/filesystem/files/{file_id}
```

**路径参数**：
- `file_id`: 文件ID

**响应**：`200 OK`
```json
{
  "id": 1,
  "name": "readme.txt",
  "type": "file",
  "path": "/readme.txt",
  "size": 1024,
  "user_id": 1,
  "parent_id": null,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": null
}
```

**错误响应**：
- `404 Not Found`: 文件不存在

---

### 4. 通过路径获取文件
```http
GET /api/filesystem/files/path/{path}
```

**路径参数**：
- `path`: 文件路径（支持多级路径，如 `/documents/work/report.txt`）

**响应**：`200 OK`
（同获取单个文件）

**错误响应**：
- `404 Not Found`: 文件不存在

---

### 5. 创建文件/文件夹
```http
POST /api/filesystem/files
```

**请求体**：
```json
{
  "name": "newfile.txt",
  "type": "file",
  "path": "/documents/newfile.txt",
  "content": "文件内容",
  "parent_id": 1
}
```

**字段说明**：
- `name`: 文件名
- `type`: 类型（"file" 或 "folder"）
- `path`: 完整路径
- `content`: 文件内容（创建文件夹时可不传或传 null）
- `parent_id`: 父文件夹ID（放在根目录时传 null 或不传）

**响应**：`201 Created`
```json
{
  "id": 3,
  "name": "newfile.txt",
  "type": "file",
  "path": "/documents/newfile.txt",
  "size": 12,
  "user_id": 1,
  "parent_id": 1,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": null
}
```

**错误响应**：
- `400 Bad Request`: 
  - 该路径的文件已存在
  - 父文件夹不存在或不是文件夹

---

### 6. 更新文件
```http
PUT /api/filesystem/files/{file_id}
```

**路径参数**：
- `file_id`: 文件ID

**请求体**：
```json
{
  "name": "renamed.txt",
  "content": "新的文件内容"
}
```

**字段说明**：
- `name`: 新文件名（可选）
- `content`: 新内容（可选）

**响应**：`200 OK`
```json
{
  "id": 3,
  "name": "renamed.txt",
  "type": "file",
  "path": "/documents/newfile.txt",
  "size": 18,
  "user_id": 1,
  "parent_id": 1,
  "created_at": "2026-03-01T12:00:00",
  "updated_at": "2026-03-01T12:05:00"
}
```

**错误响应**：
- `404 Not Found`: 文件不存在

---

### 7. 删除文件/文件夹
```http
DELETE /api/filesystem/files/{file_id}?recursive={recursive}
```

**路径参数**：
- `file_id`: 文件ID

**查询参数**：
- `recursive`: 是否递归删除子文件（删除文件夹时使用，默认 false）

**响应**：`204 No Content`

**错误响应**：
- `404 Not Found`: 文件不存在

**注意事项**：
- 删除文件夹时，如果不设置 `recursive=true`，只能删除空文件夹
- 设置 `recursive=true` 会删除该文件夹及其所有子文件/文件夹

## 使用示例

### 创建文件夹结构

```bash
# 1. 创建根目录文件夹
curl -X POST "http://127.0.0.1:8000/api/filesystem/files" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "projects",
    "type": "folder",
    "path": "/projects"
  }'

# 2. 在 projects 文件夹中创建子文件夹
curl -X POST "http://127.0.0.1:8000/api/filesystem/files" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ai-workflow",
    "type": "folder",
    "path": "/projects/ai-workflow",
    "parent_id": 1
  }'

# 3. 创建文件
curl -X POST "http://127.0.0.1:8000/api/filesystem/files" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "README.md",
    "type": "file",
    "path": "/projects/ai-workflow/README.md",
    "content": "# AI Workflow Project",
    "parent_id": 2
  }'
```

### 获取文件夹内容

```bash
# 获取根目录内容
curl -X GET "http://127.0.0.1:8000/api/filesystem/files" \
  -H "Authorization: Bearer <token>"

# 获取 projects 文件夹内容（假设ID为1）
curl -X GET "http://127.0.0.1:8000/api/filesystem/files?parent_id=1" \
  -H "Authorization: Bearer <token>"
```

## 路径规范

- 所有路径以 `/` 开头
- 路径唯一标识一个文件/文件夹
- 同一用户下路径不能重复
- 示例路径：
  - `/` - 根目录
  - `/documents` - documents 文件夹
  - `/documents/report.txt` - report.txt 文件
  - `/projects/ai-workflow/README.md` - 多级路径

## 权限控制

- 每个文件/文件夹都属于一个用户（user_id）
- 用户只能访问自己创建的文件
- 所有 API 都通过 JWT Token 验证用户身份
- 尝试访问其他用户的文件会返回 404（不暴露文件存在性）