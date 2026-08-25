---
name: nitro-api-development
description: 使用 Nitro v3 框架编写服务端接口。当用户需要创建 Nitro 接口、初始化 Nitro 配置、或咨询 Nitro 开发规范时使用此技能。适用于纯后端 Nitro 项目初始化、Vite 项目全栈化、接口开发与维护。
---

# Nitro v3 接口开发

## 核心依赖

```bash
pnpm add nitro
```

## 导入规范 [CRITICAL]

```typescript
// 必须从 nitro/h3 导入
import { defineHandler, HTTPError, readBody, getQuery, getRouterParam } from "nitro/h3";
import type { H3Event } from "nitro/h3";

// 使用项目工具函数
import { defineApiHandler, badRequest, notFound } from "../utils/api";
```

## 基础接口模板

```typescript
/**
 * @file 用户列表接口
 * @description GET /users
 */
import { defineApiHandler } from "../utils/api";

export default defineApiHandler(
	async () => {
		return await db.select().from(usersTable);
	},
	{ errorMessage: "获取用户列表失败" },
);
```

## 常见错误对比

|              错误写法               |                正确写法                |
| :---------------------------------: | :------------------------------------: |
|     `import { ... } from "h3"`      |    `import { ... } from "nitro/h3"`    |
| `import { createError } from "..."` | `import { HTTPError } from "nitro/h3"` |
|        `defineEventHandler`         | `defineHandler` 或 `defineApiHandler`  |
| `createError({ statusCode: 400 })`  | `new HTTPError({ status: 400, ... })`  |

## 详细参考

- **完整目录结构**：参阅 [reference.md](reference.md#目录结构规范)
- **公共类型定义**：参阅 [reference.md](reference.md#公共类型定义)
- **工具函数**：参阅 [reference.md](reference.md#api-处理器工具函数)
- **接口模板**：参阅 [reference.md](reference.md#接口模板)
- **配置与部署**：参阅 [reference.md](reference.md#nitro-配置)
- **函数速查表**：参阅 [reference.md](reference.md#核心函数速查)
