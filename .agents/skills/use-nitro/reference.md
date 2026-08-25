# Nitro v3 接口开发参考文档

## 目录结构规范

Nitro 支持两种目录结构，根据项目规模选择：

### 扁平结构（小型项目）

```plain
project-root/
├── server/
│   ├── routes/
│   │   ├── users.get.ts             # GET /users
│   │   ├── users.post.ts            # POST /users
│   │   └── health.get.ts            # GET /health
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── api.ts
│   └── db/
│       └── index.ts
├── nitro.config.ts
└── package.json
```

### 模块化结构（大型项目）

```plain
project-root/
├── server/
│   ├── api/
│   │   └── {module}/{feature}/
│   │       ├── list.post.ts         # POST /api/{module}/{feature}/list
│   │       └── [id].get.ts          # GET /api/{module}/{feature}/:id
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       └── api.ts
├── nitro.config.ts
└── package.json
```

### 文件路径映射规则

```plain
文件: server/routes/users.get.ts     -> GET /users
文件: server/api/users/list.post.ts  -> POST /api/users/list
```

## 公共类型定义

`server/types/index.ts`：

```typescript
/** 基础 API 响应结构 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
}

/** 分页数据结构 */
export interface PageData<T> {
	list: T[];
	total: number;
	pageIndex: number;
	pageSize: number;
	totalPages: number;
}

/** 分页响应结构 */
export type PageResponse<T> = ApiResponse<PageData<T>>;
```

## API 处理器工具函数

`server/utils/api.ts`：

```typescript
import { defineHandler, HTTPError } from "nitro/h3";
import type { H3Event } from "nitro/h3";
import type { ApiResponse } from "../types";

interface HandlerOptions {
	successMessage?: string;
	errorMessage?: string;
}

/** 创建业务错误（400 Bad Request） */
export function badRequest(message: string): HTTPError {
	return new HTTPError({ status: 400, message });
}

/** 创建未授权错误（401 Unauthorized） */
export function unauthorized(message = "未授权"): HTTPError {
	return new HTTPError({ status: 401, message });
}

/** 创建资源未找到错误（404 Not Found） */
export function notFound(message = "资源不存在"): HTTPError {
	return new HTTPError({ status: 404, message });
}

/** 定义 API 处理器，自动包装响应格式和错误处理 */
export function defineApiHandler<T>(handler: (event: H3Event) => Promise<T> | T, options?: HandlerOptions) {
	return defineHandler(async (event): Promise<ApiResponse<T>> => {
		try {
			const data = await handler(event);
			const response: ApiResponse<T> = { success: true, data };
			if (options?.successMessage) {
				response.message = options.successMessage;
			}
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : (options?.errorMessage ?? "操作失败");
			return { success: false, message };
		}
	});
}

/** 定义简单 API 处理器（无数据库操作，不需要错误处理） */
export function defineSimpleHandler<T>(handler: (event: H3Event) => Promise<T> | T, options?: HandlerOptions) {
	return defineHandler(async (event): Promise<ApiResponse<T>> => {
		const data = await handler(event);
		const response: ApiResponse<T> = { success: true, data };
		if (options?.successMessage) {
			response.message = options.successMessage;
		}
		return response;
	});
}
```

## 接口模板

### 基础接口（使用 defineApiHandler）

```typescript
/**
 * @file 用户列表接口
 * @description User list API
 * GET /users
 */

import { defineApiHandler } from "../utils/api";
import { db, usersTable } from "../db";

export default defineApiHandler(
	async () => {
		return await db.select().from(usersTable);
	},
	{ errorMessage: "获取用户列表失败" },
);
```

### 简单接口（使用 defineSimpleHandler）

```typescript
/**
 * @file 示例用户接口
 * @description Example user API
 * GET /user
 */

import { defineSimpleHandler } from "../utils/api";

export default defineSimpleHandler(() => ({
	name: "John Doe",
	age: 20,
	email: "john.doe@example.com",
}));
```

### 带参数验证的接口

```typescript
/**
 * @file 创建用户接口
 * @description Create user API
 * POST /users
 */

import { readBody } from "nitro/h3";
import { defineApiHandler, badRequest } from "../utils/api";
import { db, usersTable } from "../db";
import type { InsertUser } from "../db";

export default defineApiHandler(
	async (event) => {
		const body = await readBody<InsertUser>(event);

		if (!body.name || !body.email) {
			throw badRequest("name 和 email 是必填字段");
		}

		const [newUser] = await db.insert(usersTable).values(body).returning();
		return newUser;
	},
	{ successMessage: "创建成功", errorMessage: "创建用户失败" },
);
```

## Nitro 配置

### 基础配置

```typescript
import { defineConfig } from "nitro";

export default defineConfig({
	serverDir: "server",
	imports: false,
	compatibilityDate: "2024-09-19",
	devServer: {
		port: 3000,
	},
});
```

### 完整配置

```typescript
import { defineConfig } from "nitro";

export default defineConfig({
	/** 服务端代码目录 */
	serverDir: "server",

	/** 禁用自动导入，显式声明所有依赖 */
	imports: false,

	/** 兼容性日期 */
	compatibilityDate: "2024-09-19",

	/** 开发服务器配置 */
	devServer: {
		port: 3000,
		watch: ["./server/**/*.ts"],
	},

	/** 路径别名配置 */
	alias: {
		"@": "./src",
		server: "./server",
	},
});
```

### Vite 集成

```typescript
// vite.config.ts
import { nitro } from "nitro/vite";

export default defineConfig({
	plugins: [nitro()],
});
```

## 部署配置

### 环境变量规范

```bash
# Nitro 运行时配置前缀必须为 NITRO_
NITRO_API_TOKEN="your-api-token"

# 部署预设
NITRO_PRESET=cloudflare_module  # Cloudflare Workers
NITRO_PRESET=vercel             # Vercel
NITRO_PRESET=node               # Node.js 服务器
```

### 环境变量访问

```typescript
import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
	// 必须在事件处理器内访问
	const config = useRuntimeConfig();
	return { value: config.apiToken };
});
```

### 部署预设列表

|        预设         |        平台        |
| :-----------------: | :----------------: |
|       `node`        |   Node.js 服务器   |
| `cloudflare_module` | Cloudflare Workers |
| `cloudflare_pages`  |  Cloudflare Pages  |
|      `vercel`       |       Vercel       |
|      `netlify`      |      Netlify       |
|      `static`       |      静态站点      |
|       `deno`        |    Deno Deploy     |

## 核心函数速查

### 请求处理函数

|         函数          |    来源    |                          说明 |
| :-------------------: | :--------: | ----------------------------: |
|  `defineApiHandler`   |  项目工具  | 定义 API 处理器（带错误处理） |
| `defineSimpleHandler` |  项目工具  |  定义简单处理器（无错误处理） |
|    `defineHandler`    | `nitro/h3` |        定义原始请求处理器函数 |
|      `readBody`       | `nitro/h3` |                读取请求体数据 |
|      `getQuery`       | `nitro/h3` |             获取 URL 查询参数 |
|   `getRouterParam`    | `nitro/h3` |              获取路由动态参数 |

### 错误辅助函数

|      函数      | 状态码 |             说明 |
| :------------: | :----: | ---------------: |
|  `badRequest`  |  400   | 业务参数校验失败 |
| `unauthorized` |  401   |       未授权访问 |
|  `forbidden`   |  403   |         禁止访问 |
|   `notFound`   |  404   |       资源不存在 |
| `serverError`  |  500   |   服务器内部错误 |

### 运行时配置函数

|        函数        |          来源          |               说明 |
| :----------------: | :--------------------: | -----------------: |
| `useRuntimeConfig` | `nitro/runtime-config` | 获取运行时配置对象 |

### 错误类型

|     类型/函数     |    来源    |                         说明 |
| :---------------: | :--------: | ---------------------------: |
|    `HTTPError`    | `nitro/h3` | 错误类（替代废弃的 H3Error） |
| `new HTTPError()` | `nitro/h3` | 创建错误（替代 createError） |

## 项目初始化检查清单

### 纯后端项目

- [ ] 安装 `nitro` 依赖包
- [ ] 创建 `server/routes/` 目录结构
- [ ] 创建 `server/types/index.ts` 公共类型定义
- [ ] 创建 `server/utils/api.ts` 处理器工具函数
- [ ] 创建 `nitro.config.ts` 配置文件
- [ ] 添加开发和构建脚本到 `package.json`

### Vite 项目全栈化

- [ ] 安装 `nitro` 依赖包
- [ ] 在 Vite 插件配置中添加 `nitro()` 插件
- [ ] 创建 `server/` 目录结构
- [ ] 创建 `server/types/index.ts` 公共类型定义
- [ ] 创建 `server/utils/api.ts` 处理器工具函数
- [ ] 创建 `nitro.config.ts` 配置文件

## 开发命令速查

```bash
# 开发模式
pnpm nitro dev

# 构建
pnpm nitro build

# 预览
pnpm nitro preview

# 类型检查
pnpm typecheck
```

## 附加资源

- **官方文档**：https://v3.nitro.build/
