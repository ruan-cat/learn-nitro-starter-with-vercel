# Drizzle ORM + Neon 数据库入门指南

本文档帮助你快速掌握 Drizzle ORM 和 Neon 数据库的核心概念和使用方法。

## 1. 核心概念

### 1.1. 什么是 Drizzle ORM？

**ORM (Object-Relational Mapping)** 是一种将数据库表映射为代码对象的技术。Drizzle 是一个轻量级、类型安全的 TypeScript ORM。

|   概念    |                 说明                  |
| :-------: | :-----------------------------------: |
|  Schema   | 用 TypeScript 代码定义的数据库表结构  |
| Migration | 数据库结构变更的 SQL 脚本（版本控制） |
|   Query   |     使用 ORM API 执行的数据库操作     |

### 1.2. 什么是 Neon？

Neon 是一个 **Serverless PostgreSQL** 云数据库服务，特点：

1. 按需扩展，按使用量计费
2. 支持数据库分支（像 Git 一样管理数据库）
3. 与 Vercel 深度集成

### 1.3. 三者关系图解

```
┌─────────────────────────────────────────────────────────────┐
│                        你的代码                              │
├─────────────────────────────────────────────────────────────┤
│  schema.ts          →  db.insert(usersTable)...            │
│  (定义表结构)            (执行数据库操作)                     │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Drizzle Kit                             │
├─────────────────────────────────────────────────────────────┤
│  drizzle-kit generate  →  生成 SQL 迁移文件                 │
│  drizzle-kit migrate   →  执行迁移到数据库                   │
│  drizzle-kit studio    →  可视化数据库管理界面               │
└──────────────┬──────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│                     Neon 数据库                              │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL 云数据库，存储真实数据                           │
└─────────────────────────────────────────────────────────────┘
```

## 2. 项目文件结构

```
项目根目录/
├── .env                    # 环境变量（包含数据库连接字符串）
├── .env.example            # 环境变量示例
├── drizzle.config.ts       # Drizzle Kit 配置
├── drizzle/                # 生成的迁移文件目录
│   └── 0000_xxx.sql        # SQL 迁移文件
└── server/
    └── db/
        ├── index.ts        # 数据库连接实例
        └── schema.ts       # 表结构定义
```

## 3. 定义数据库表（Schema）

### 3.1. 基本语法

```typescript
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  // 字段名: 字段类型("数据库列名").约束()
  id: serial("id").primaryKey(), // 自增主键
  name: text("name").notNull(), // 非空文本
  email: text("email").notNull().unique(), // 非空 + 唯一
  age: integer("age"), // 可空整数
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

### 3.2. 常用字段类型

| Drizzle 类型  | PostgreSQL 类型 |   说明    |
| :-----------: | :-------------: | :-------: |
|  `serial()`   |    `SERIAL`     | 自增整数  |
|   `text()`    |     `TEXT`      |   文本    |
|  `integer()`  |    `INTEGER`    |   整数    |
|  `boolean()`  |    `BOOLEAN`    |  布尔值   |
| `timestamp()` |   `TIMESTAMP`   |  时间戳   |
|   `json()`    |     `JSON`      | JSON 数据 |

### 3.3. 常用约束

|             约束方法              |     说明     |
| :-------------------------------: | :----------: |
|          `.primaryKey()`          |     主键     |
|           `.notNull()`            |     非空     |
|            `.unique()`            |     唯一     |
|         `.default(value)`         |    默认值    |
|          `.defaultNow()`          | 默认当前时间 |
| `.references(() => table.column)` |   外键关联   |

## 4. 数据库命令速查

### 4.1. 生成迁移文件

当你修改了 `schema.ts` 后，运行此命令生成 SQL 迁移文件：

```bash
pnpm db:generate
```

这会在 `drizzle/` 目录下生成类似 `0000_create_users.sql` 的文件。

### 4.2. 执行迁移

将生成的 SQL 应用到真实数据库：

```bash
pnpm db:migrate
```

### 4.3. 快速推送（开发环境）

跳过迁移文件，直接将 Schema 变更推送到数据库（**仅用于开发**）：

```bash
pnpm db:push
```

### 4.4. 可视化管理

启动 Drizzle Studio 可视化界面：

```bash
pnpm db:studio
```

浏览器访问 `https://local.drizzle.studio` 可查看和编辑数据。

### 4.5. 删除迁移

删除最近一次生成的迁移文件：

```bash
pnpm db:drop
```

## 5. 更新表结构的工作流

### 5.1. 添加新字段

**场景：** 给用户表添加 `phone` 字段

**步骤：**

1. 修改 `server/db/schema.ts`：

```typescript
export const usersTable = pgTable("users", {
  // ... 现有字段
  phone: text("phone"), // 新增字段
});
```

2. 生成迁移文件：

```bash
pnpm db:generate
```

3. 执行迁移：

```bash
pnpm db:migrate
```

### 5.2. 修改字段

**场景：** 将 `age` 字段改为必填

**步骤：**

1. 修改 Schema：

```typescript
age: integer("age").notNull(),  // 添加 .notNull()
```

2. 生成并执行迁移：

```bash
pnpm db:generate && pnpm db:migrate
```

## 6. 迁移回滚

Drizzle 不像一些 ORM 那样自动生成回滚脚本。推荐做法：

### 6.1. 方法一：手动回滚

1. 查看 `drizzle/` 目录下的迁移文件，了解变更内容
2. 编写反向 SQL 并手动执行
3. 删除对应的迁移记录

### 6.2. 方法二：修正后重新迁移

1. 修改 `schema.ts` 回到正确状态
2. 运行 `pnpm db:generate` 生成新的迁移
3. 运行 `pnpm db:migrate` 应用修正

### 6.3. 方法三：使用 Neon 分支（推荐）

在 Neon Dashboard 中：

1. 创建数据库分支进行测试
2. 测试完成后合并或删除分支
3. 如果出问题，直接删除分支即可

## 7. 基本 CRUD 操作

### 7.1. 查询数据

```typescript
import { db, usersTable } from "./db";
import { eq } from "drizzle-orm";

// 查询所有
const allUsers = await db.select().from(usersTable);

// 条件查询
const user = await db.select().from(usersTable).where(eq(usersTable.id, 1));
```

### 7.2. 插入数据

```typescript
const newUser = await db
  .insert(usersTable)
  .values({ name: "张三", email: "zhang@example.com" })
  .returning();
```

### 7.3. 更新数据

```typescript
await db.update(usersTable).set({ name: "李四" }).where(eq(usersTable.id, 1));
```

### 7.4. 删除数据

```typescript
await db.delete(usersTable).where(eq(usersTable.id, 1));
```

## 8. 快速开始步骤

1. **配置环境变量：** 复制 `.env.example` 为 `.env`，填入你的 Neon 数据库连接字符串

2. **生成迁移：** `pnpm db:generate`

3. **执行迁移：** `pnpm db:migrate`

4. **启动开发服务器：** `pnpm dev`

5. **测试 API：**
   - 健康检查：`GET http://localhost:8080/health`
   - 获取用户：`GET http://localhost:8080/users`
   - 创建用户：`POST http://localhost:8080/users` (Body: `{ "name": "测试", "email": "test@example.com" }`)

## 9. 常见问题

### 9.1. 连接失败

检查 `.env` 中的 `DATABASE_URL` 是否正确，格式应为：

```
postgresql://username:password@host.neon.tech/database?sslmode=require
```

### 9.2. 迁移冲突

如果迁移失败，可以：

1. 删除 `drizzle/` 目录下的冲突文件
2. 重新运行 `pnpm db:generate`

### 9.3. 类型错误

确保已运行 `pnpm prepare` 生成 Nitro 类型文件。
