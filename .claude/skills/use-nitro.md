# Nitro v3 接口开发技能规范

本技能用于指导使用 Nitro v3 框架编写服务端接口，包括项目初始化、配置、接口编写规范等完整流程。

## 1. 适用场景

- **纯后端 Nitro 项目初始化**：对非 Vite 的 Node.js 项目，初始化 Nitro 示例代码和配置
- **Vite 项目全栈化**：对 Vite 项目，初始化 Nitro 接口和配置，赋予全栈能力
- **接口开发与维护**：按规范编写 Nitro v3 格式的接口代码

## 2. 核心依赖

```bash
# Nitro v3 核心包
pnpm add nitro

# 可选：日志工具
pnpm add consola
```

## 3. 目录结构规范

Nitro 支持两种目录结构，根据项目规模选择：

**扁平结构（推荐用于小型项目）**

```plain
project-root/
├── server/                          # Nitro 服务端目录
│   ├── routes/                      # API 路由目录
│   │   ├── users.get.ts             # GET /users
│   │   ├── users.post.ts            # POST /users
│   │   └── health.get.ts            # GET /health
│   ├── types/                       # 公共类型定义
│   │   └── index.ts
│   ├── utils/                       # 工具函数
│   │   └── api.ts                   # API 处理器工具函数
│   └── db/                          # 数据库相关（可选）
│       └── index.ts
├── nitro.config.ts                  # Nitro 配置文件
└── package.json
```

**模块化结构（适用于大型项目）**

```plain
project-root/
├── server/                          # Nitro 服务端目录
│   ├── api/                         # API 接口目录
│   │   └── {module}/{feature}/
│   │       ├── list.post.ts         # 列表查询接口
│   │       └── [id].get.ts          # 详情接口
│   ├── types/                       # 公共类型定义
│   │   └── index.ts
│   └── utils/                       # 工具函数
│       └── api.ts                   # API 处理器工具函数
├── nitro.config.ts                  # Nitro 配置文件
└── package.json
```

**文件路径映射规则**：文件路径直接映射为 API 路径

```plain
文件: server/routes/users.get.ts     -> GET /users
文件: server/api/users/list.post.ts  -> POST /api/users/list
```

## 4. 核心规范 [CRITICAL]

**导入模块规范**

```typescript
// 必须从 nitro/h3 导入，不是 h3
import { defineHandler, HTTPError } from "nitro/h3";
import type { H3Event } from "nitro/h3";

// 使用项目工具函数（推荐）
import { defineApiHandler, badRequest } from "../utils/api";

// 类型导入（根据项目实际定义）
import type { ApiResponse } from "../types";
```

**公共类型定义** (`server/types/index.ts`)

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

**API 处理器工具函数** (`server/utils/api.ts`)

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

**基础接口模板（使用 defineApiHandler）**

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

**简单接口模板（使用 defineSimpleHandler）**

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

**带参数验证的接口模板**

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

**关键要点检查清单**

1. **导入来源**：`nitro/h3` 而非 `h3`
2. **处理器函数**：优先使用 `defineApiHandler`（带错误处理）或 `defineSimpleHandler`（简单接口）
3. **错误处理**：使用 `HTTPError` 和辅助函数（`badRequest`、`notFound` 等），避免手写 try-catch
4. **JSDoc 注释**：包含 `@file`、`@description` 和接口路径
5. **类型约束**：为请求体和响应添加类型定义

## 5. 常见错误对比

|                  错误写法                   |                   正确写法                   |
| :-----------------------------------------: | :------------------------------------------: |
|  `import { defineEventHandler } from "h3"`  |  `import { defineHandler } from "nitro/h3"`  |
|  `import { createError } from "nitro/h3"`   |    `import { HTTPError } from "nitro/h3"`    |
| `createError({ statusCode: 400, message })` |  `new HTTPError({ status: 400, message })`   |
|  `export default defineEventHandler(...)`   |    `export default defineApiHandler(...)`    |
|           每个接口手写 try-catch            |     使用 `defineApiHandler` 自动处理错误     |
|          缺少类型约束的请求体读取           |         `readBody<YourType>(event)`          |
|             直接返回对象无结构              | 返回 `{ success, message, data }` 结构化响应 |

## 6. Nitro 配置

**基础配置**

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

**完整配置示例**

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

	/** 路径别名配置（可选） */
	alias: {
		"@": "./src",
		server: "./server",
	},
});
```

**Vite 集成**

```typescript
// vite.config.ts 或 build/plugins/index.ts
import { nitro } from "nitro/vite";

export default defineConfig({
	plugins: [
		// 其他插件...
		nitro(),
	],
});
```

## 7. 部署配置

**环境变量规范**

```bash
# Nitro 运行时配置前缀必须为 NITRO_
NITRO_API_TOKEN="your-api-token"

# 部署预设
NITRO_PRESET=cloudflare_module  # Cloudflare Workers
NITRO_PRESET=vercel             # Vercel
NITRO_PRESET=node               # Node.js 服务器
```

**环境变量访问**

```typescript
import { defineHandler } from "nitro/h3";
import { useRuntimeConfig } from "nitro/runtime-config";

export default defineHandler((event) => {
	// 必须在事件处理器内访问
	const config = useRuntimeConfig();
	return { value: config.apiToken };
});
```

## 8. 响应格式规范

推荐使用统一的响应格式，便于前端处理：

**基础响应结构**

```typescript
interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}
```

**分页响应结构（可选）**

```typescript
interface PageResponse<T> {
	success: boolean;
	message?: string;
	data: {
		list: T[];
		total: number;
		pageIndex: number;
		pageSize: number;
		totalPages: number;
	};
}
```

## 9. 项目初始化检查清单

**纯后端项目**

- [ ] 安装 `nitro` 依赖包
- [ ] 创建 `server/routes/` 目录结构
- [ ] 创建 `server/types/index.ts` 公共类型定义
- [ ] 创建 `server/utils/api.ts` 处理器工具函数
- [ ] 创建 `nitro.config.ts` 配置文件
- [ ] 添加开发和构建脚本到 `package.json`

**Vite 项目全栈化**

- [ ] 安装 `nitro` 依赖包
- [ ] 在 Vite 插件配置中添加 `nitro()` 插件
- [ ] 创建 `server/` 目录结构
- [ ] 创建 `server/types/index.ts` 公共类型定义
- [ ] 创建 `server/utils/api.ts` 处理器工具函数
- [ ] 创建 `nitro.config.ts` 配置文件

## 10. 核心函数速查

**请求处理函数**

|         函数          |    来源    |                          说明 |
| :-------------------: | :--------: | ----------------------------: |
|  `defineApiHandler`   |  项目工具  | 定义 API 处理器（带错误处理） |
| `defineSimpleHandler` |  项目工具  |  定义简单处理器（无错误处理） |
|    `defineHandler`    | `nitro/h3` |        定义原始请求处理器函数 |
|      `readBody`       | `nitro/h3` |                读取请求体数据 |
|      `getQuery`       | `nitro/h3` |             获取 URL 查询参数 |
|   `getRouterParam`    | `nitro/h3` |              获取路由动态参数 |

**错误辅助函数**

|      函数      | 状态码 |             说明 |
| :------------: | :----: | ---------------: |
|  `badRequest`  |  400   | 业务参数校验失败 |
| `unauthorized` |  401   |       未授权访问 |
|  `forbidden`   |  403   |         禁止访问 |
|   `notFound`   |  404   |       资源不存在 |
| `serverError`  |  500   |   服务器内部错误 |

**运行时配置函数**

|        函数        |          来源          |               说明 |
| :----------------: | :--------------------: | -----------------: |
| `useRuntimeConfig` | `nitro/runtime-config` | 获取运行时配置对象 |

**错误类型（h3 最新版本）**

|     类型/函数     |    来源    |                         说明 |
| :---------------: | :--------: | ---------------------------: |
|    `HTTPError`    | `nitro/h3` | 错误类（替代废弃的 H3Error） |
| `new HTTPError()` | `nitro/h3` | 创建错误（替代 createError） |

## 11. 部署预设列表

|        预设         |        平台        |
| :-----------------: | :----------------: |
|       `node`        |   Node.js 服务器   |
| `cloudflare_module` | Cloudflare Workers |
| `cloudflare_pages`  |  Cloudflare Pages  |
|      `vercel`       |       Vercel       |
|      `netlify`      |      Netlify       |
|      `static`       |      静态站点      |
|       `deno`        |    Deno Deploy     |

## 12. 开发命令速查

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

## 13. 附加资源

- **官方文档**：https://v3.nitro.build/
