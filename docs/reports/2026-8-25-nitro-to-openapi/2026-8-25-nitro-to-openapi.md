# 2026-8-25 Nitro 接口批量生成 OpenAPI JSON 信息表的工具调研

> 本报告由 WorkBuddy（AI agent 工具）调研生成，AI 模型：DeepSeek-V4-Flash。
> 调研日期：2026-08-25。
> 调研范围：Nitro 官方文档（nitro.build）、GitHub（nitrojs/nitro）、npm 生态、社区实践，以及**本地 `node_modules/nitro` 源码直接验证**。

## 1. 结论摘要（TL;DR）

1. **首选方案：Nitro 官方内置 OpenAPI 生成能力，零第三方依赖**。Nitro v3 内置「扫描路由 → 生成 OpenAPI 3.1.0 JSON」的能力，开启后访问 `/_openapi.json` 即可拿到标准 OpenAPI JSON，`/_scalar`、`/_swagger` 直接提供交互式文档界面。
2. **本地版本已确认可用**：当前项目安装的 `nitro@3.0.1-alpha.1` 的 `node_modules` 中已包含 `openapi.mjs` / `scalar.mjs` / `swagger.mjs` 运行时模块，且构建器源码 `common2.mjs` 中明确存在 `if (nitro.options.experimental.openAPI) plugins.push(routeMeta(nitro))` 的开关逻辑——**无需升级、无需安装任何包**，加两行配置即可生成 OpenAPI JSON。
3. **唯一的现实成本**：已有接口（如 `users.get.ts`）没有写 `defineRouteMeta` 元数据，开启后生成的是「裸 200 OK」级别的低信息量 spec（路径、方法、路径参数可自动推断，但请求/响应 schema 需要补）。补元数据是批量生成高质量 OpenAPI JSON 的关键动作，报告第 9、11 章给出迁移路径。
4. **备选方案**（按推荐度）：swagger-jsdoc（JSDoc 注释驱动）、zod-to-openapi（Schema 驱动，可同时获得运行时校验）、TS 类型推断（ts-json-schema-generator）、第三方插件 `@byyuurin/nitro-openapi`（WIP，不推荐）。详见第 3 章对比表。
5. **生成 OpenAPI JSON 之后**：内置 Scalar/Swagger UI 可直接用；也可接入 RapiDoc、Redocly、Stoplight Elements，或 apiful / openapi-typescript / orval 生成类型安全客户端（第 10 章）。

## 2. 核心结论：Nitro v3 官方已内置 OpenAPI 生成能力

### 2.1 官方能力概述

Nitro 官方文档（https://nitro.build/docs/openapi）确认：**Nitro 会扫描全部路由处理器，提取 `defineRouteMeta` 定义的元数据，自动生成 OpenAPI 3.1.0 规范，并内置 Scalar 与 Swagger UI 两套交互式文档界面**。该能力目前标记为 **experimental（实验性）\*\*。

开启后（开发环境默认可用）获得三个端点：

|       端点       | 说明                                                    |
| :--------------: | :------------------------------------------------------ |
| `/_openapi.json` | OpenAPI 3.1.0 JSON 规范（用户诉求的「openapi 信息表」） |
|    `/_scalar`    | Scalar API 参考文档 UI                                  |
|   `/_swagger`    | Swagger UI 文档界面                                     |

### 2.2 本地版本直接验证（证据链）

在 `node_modules/nitro/dist/` 中确认以下事实（版本 `3.0.1-alpha.1`）：

```log
# ① OpenAPI 运行时模块已内置
node_modules/nitro/dist/runtime/internal/routes/openapi.mjs
node_modules/nitro/dist/runtime/internal/routes/scalar.mjs
node_modules/nitro/dist/runtime/internal/routes/swagger.mjs

# ② experimental.openAPI 配置开关已接入构建插件
node_modules/nitro/dist/_build/common2.mjs:740
  if (nitro.options.experimental.openAPI) plugins.push(routeMeta(nitro));

# ③ defineRouteMeta 宏：运行时 no-op，构建期由 AST 静态提取
node_modules/nitro/dist/runtime/internal/meta.mjs
  export function defineRouteMeta(meta) { return meta; }
node_modules/nitro/dist/_build/common2.mjs:274
  遍历 AST，识别 defineRouteMeta(...) 调用，静态提取元数据
```

`openapi.mjs` 源码确认的生成逻辑（对方案理解与预期管理很重要）：

|    行为    | 说明                                                                                                   |
| :--------: | :----------------------------------------------------------------------------------------------------- |
|  输出格式  | `openapi: "3.1.0"` + `info` + `servers` + `paths` + `components`                                       |
|  路径参数  | `:id` 与 `[id]` 语法自动转换为 OpenAPI 路径参数 `{id}`（`required: true, schema: { type: "string" }`） |
|  默认响应  | 未写元数据的路由默认生成 `responses: { 200: { description: "OK" } }`（信息量低）                       |
|  自动分组  | 按路径前缀自动打 tag：`/api/` → `API Routes`；`/_` → `Internal`；其余 → `App Routes`                   |
|  全局组件  | `defineRouteMeta` 中的 `$global` 字段会提升到顶层 `components`，支持 `$ref` 复用                       |
| 元数据合并 | 多个 handler 的 meta 通过 `defu` 合并（后写覆盖先写）                                                  |

## 3. 方案对比总览

|                    方案                     | 生成原理                                                        |             上手成本              |            文档质量             |            维护成本            | 适配本项目（alpha.1 + defineApiHandler） |
| :-----------------------------------------: | :-------------------------------------------------------------- | :-------------------------------: | :-----------------------------: | :----------------------------: | :--------------------------------------- |
|      **A. Nitro 内置 OpenAPI**（推荐）      | 构建期扫描路由 + `defineRouteMeta` 宏                           | 低（配置 2 行 + 逐个路由补 meta） |  中→高（取决于 meta 写的多细）  |   低（官方维护，随框架演进）   | ✅ 官方一等公民，本地已验证可用          |
|            **B. swagger-jsdoc**             | 解析 JSDoc `@openapi` 注释生成 spec                             |       中（需改写注释格式）        |        高（注释即文档）         |     中（注释与代码易漂移）     | ⚠️ 社区成熟方案，可独立也可与 A 合并     |
|            **C. zod-to-openapi**            | Zod schema → OpenAPI schema                                     |     中高（引入 zod + 注册器）     |        高（类型即文档）         |        低（单事实来源）        | ⚠️ 适合新项目或想引入运行时校验时        |
|             **D. TS 类型推断**              | ts-json-schema-generator 等：TS 类型 → JSON Schema → components |    中（需维护类型 + 组装脚本）    | 中（无 description 等语义信息） |               中               | ⚠️ 可作 components 生成补充手段          |
| **E. 第三方插件** `@byyuurin/nitro-openapi` | Nitro plugin 内手动 register/merge                              |                中                 |               中                | 高（WIP，仅适配 nitropack v2） | ❌ 不推荐（WIP 状态、面向 v2）           |
|   **F. AI/脚本批量生成 defineRouteMeta**    | 扫描现有路由文件，AI/脚本补齐 meta 代码                         |            一次性成本             |               高                |       低（之后随路由走）       | ✅ 已有大量接口时的现实迁移路径          |

**结论**：方案 A 是生成「OpenAPI JSON 信息表」的最优解；方案 F 是解决「已有接口批量补齐元数据」的配套手段；B/C 是 A 的替代或补充。

## 4. 方案 A 详解：Nitro 官方内置 OpenAPI（推荐首选）

### 4.1 开启方式（nitro.config.ts）

```typescript
import { defineConfig } from "nitro";

export default defineConfig({
	// ...现有配置
	experimental: {
		openAPI: true, // 开启 OpenAPI 生成（开发环境默认可用）
	},
	openAPI: {
		meta: {
			title: "learn-nitro-starter API",
			description: "Nitro v3 学习项目接口文档",
			version: "1.0.0",
		},
		// 可选：自定义路由（默认 /_openapi.json）
		// route: "/_docs/openapi.json",
		// 可选：生产环境开启（默认关闭）
		// production: "runtime", // 或 "prerender"（构建期生成静态文件，性能最优）
	},
});
```

开启后执行 `pnpm dev`，访问 `http://localhost:8080/_openapi.json` 即可拿到完整 OpenAPI JSON。

### 4.2 路由元数据：defineRouteMeta 宏

`defineRouteMeta` 是**构建时宏**（运行时为 no-op，构建期由 AST 静态提取，无运行时开销）。`openAPI` 属性接受标准 OpenAPI Operation Object。

以本项目 `server/routes/api/users.get.ts` 为例，补齐元数据后的形态：

```typescript
/**
 * @file 用户列表接口
 * @description User list API
 * GET /users
 */
import { defineRouteMeta, defineHandler } from "nitro";
import { defineApiHandler } from "server/utils/api";
import { db, usersTable } from "server/db";

defineRouteMeta({
	openAPI: {
		tags: ["users"],
		summary: "获取用户列表",
		description: "返回全部用户（经 ApiResponse 统一包装）",
		responses: {
			200: {
				description: "成功",
				content: {
					"application/json": {
						schema: { $ref: "#/components/schemas/ApiResponseUserList" },
					},
				},
			},
		},
		$global: {
			components: {
				schemas: {
					// 统一响应包装（与本项目 server/utils/api.ts 的 ApiResponse 结构对应）
					ApiResponseUserList: {
						type: "object",
						required: ["success", "data"],
						properties: {
							success: { type: "boolean", example: true },
							data: {
								type: "array",
								items: { $ref: "#/components/schemas/User" },
							},
							message: { type: "string", example: "操作成功" },
						},
					},
					User: {
						type: "object",
						properties: {
							id: { type: "number" },
							name: { type: "string" },
							email: { type: "string", format: "email" },
						},
					},
				},
			},
		},
	},
});

export default defineApiHandler(
	async () => {
		return await db.select().from(usersTable);
	},
	{ errorMessage: "获取用户列表失败" },
);
```

要点：

1. **`defineRouteMeta` 与 `defineHandler` 一样从 `nitro` 导入**（`import { defineRouteMeta, defineHandler } from "nitro"`）。
2. **必须使用静态对象字面量**：构建期宏要求元数据是字面量对象，不能使用运行时变量或异步函数（官方文档与社区实践均强调此限制）。
3. **路径参数自动推断**：`[id]` 或 `:id` 路由无需手写 path 参数，Nitro 自动转换；只需补充 query/header 参数与响应 schema。
4. **`$global` 定义可复用组件**，提升到顶层 `components`，其他路由可用 `$ref` 引用，避免重复声明。
5. **自动 tag**：`/api/` 前缀路由默认归属 `API Routes` tag，可用 `tags` 覆盖。

### 4.3 配置项速查

|           配置项           |                       默认值                       | 说明                                                                                                      |
| :------------------------: | :------------------------------------------------: | :-------------------------------------------------------------------------------------------------------- |
|   `experimental.openAPI`   |                      `false`                       | 总开关                                                                                                    |
|       `openAPI.meta`       | `title: "Nitro Server Routes"`、`version: "1.0.0"` | 生成 spec 的 `info` 对象                                                                                  |
|      `openAPI.route`       |                 `"/_openapi.json"`                 | OpenAPI JSON 的访问路径                                                                                   |
| `openAPI.ui.scalar.route`  |                    `"/_scalar"`                    | Scalar UI 路径（可设 `false` 禁用）                                                                       |
| `openAPI.ui.swagger.route` |                   `"/_swagger"`                    | Swagger UI 路径（可设 `false` 禁用）                                                                      |
|    `openAPI.production`    |                      `false`                       | 生产环境关闭；`"runtime"` 每次请求动态生成；`"prerender"` 构建期生成静态文件（性能最优，spec 不变时推荐） |

### 4.4 局限性（如实披露）

1. **experimental 状态**：API 形态可能随版本调整（如 beta 版曾修复 route-meta 去重问题），升级需回归验证。
2. **无 meta 即低信息量**：未写 `defineRouteMeta` 的路由只有 `200: OK` 空壳，请求/响应 schema 不会从 handler 代码自动推断——这是「批量生成高质量 OpenAPI」的唯一现实障碍。
3. **宏限制**：meta 必须是静态字面量，无法用共享常量直接构造（但可通过 `$global` 复用 schema，且字面量内可引用 `as const` 常量）。
4. **开发/生产差异**：默认仅开发环境可用，生产启用需注意鉴权（`/_openapi.json` 会暴露全部路由信息）。

## 5. 方案 B：swagger-jsdoc（JSDoc 注释驱动）

### 5.1 原理

`swagger-jsdoc` 解析源码中的 `@openapi` JSDoc 注释块，合并为完整 OpenAPI spec。这是 Nitro 社区使用最久的方案（nitrojs/nitro discussion #170 中即有此实践，自 2022 年起被验证）。

### 5.2 示例

```typescript
// server/routes/api/users.get.ts
/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: 获取用户列表
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array, items: { $ref: "#/components/schemas/User" } }
 */
export default defineHandler(() => {
	/* ... */
});

// server/routes/api/docs.get.ts（文档聚合路由）
import swaggerJSDoc from "swagger-jsdoc";
export default defineHandler(() => {
	return swaggerJSDoc({
		swaggerDefinition: { openapi: "3.1.0", info: { title: "API", version: "1.0.0" } },
		apis: ["server/routes/api/**/*.ts"],
	});
});
```

### 5.3 优缺点

| 优点                                                                                                        | 缺点                                  |
| :---------------------------------------------------------------------------------------------------------- | :------------------------------------ |
| 社区成熟、文档多、可独立于 Nitro 使用                                                                       | 注释与代码易漂移，无类型保障          |
| JSDoc 注释贴近代码，读者友好                                                                                | 需将现有 JSDoc 改写为 `@openapi` 格式 |
| 可与方案 A 合并（用 `defu` 深合并 nitro 生成的 spec 与 swagger-jsdoc 生成物，discussion #170 已验证此路径） | 解析依赖 glob 模式，大型项目性能一般  |

## 6. 方案 C：zod-to-openapi（Schema 驱动，单一事实来源）

### 6.1 原理

`@asteasolutions/zod-to-openapi`（zod-openapi 同类）：定义一个 Zod schema，同时产出「运行时校验 + TS 类型 + OpenAPI schema」三件事，从根本上消除三份文档漂移问题。Hono 生态的 `@hono/zod-openapi` 是同类思路的著名实现。

### 6.2 与 Nitro/H3 的结合

H3 v2+ 提供 `readValidatedBody(event, schema.parse)`、`getValidatedQuery` 等校验工具，配合 zod 即可在路由内完成校验，同时用 zod-to-openapi 注册 schema 生成 OpenAPI 的 `components` 与 `paths`：

```typescript
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { createOpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);
const registry = createOpenAPIRegistry();

// 定义一个 schema：校验 + 类型 + 文档三合一
const UserSchema = z.object({ id: z.number(), name: z.string(), email: z.string().email() }).openapi("User");

registry.registerPath({
	method: "get",
	path: "/api/users",
	summary: "获取用户列表",
	responses: {
		200: { description: "成功", content: { "application/json": { schema: UserSchema.array() } } },
	},
});
```

### 6.3 优缺点

| 优点                                             | 缺点                                  |
| :----------------------------------------------- | :------------------------------------ |
| 单一事实来源，杜绝文档漂移                       | 引入 zod 依赖 + 注册器样板代码        |
| schema 直接用于运行时校验（`readValidatedBody`） | 对已有无 zod 的接口是重写式改造       |
| 生成质量高，支持 description/example 等元数据    | 与 Nitro 内置方案并存时需注意双轨维护 |

社区参考：DeepWiki 收录的 dave-io 项目即采用「zod schema 集中在 `server/utils/schemas.ts` + openapi-registry 注册 + 独立 bin 脚本输出 `openapi.json`」的成熟架构。

## 7. 方案 D：TypeScript 类型推断生成 JSON Schema

### 7.1 原理

使用 `ts-json-schema-generator`（或 `typescript-json-schema`）从 TS 类型/接口直接生成 JSON Schema，再组装进 OpenAPI 的 `components.schemas`，配合 `$ref` 引用。

```bash
pnpm add -D ts-json-schema-generator
npx ts-json-schema-generator --path 'server/types/index.ts' --type 'User' -o schema.json
```

### 7.2 优缺点

| 优点                                | 缺点                                          |
| :---------------------------------- | :-------------------------------------------- |
| 从已有 TS 类型零成本生成基础 schema | 无 description/summary 等语义信息，需二次加工 |
| 类型与 schema 天然同步              | 生成物需脚本组装进 OpenAPI 文档               |
| 适合为「大量已有类型」快速铺底      | 泛型、复杂联合类型支持有限                    |

定位：适合作为方案 A 的补充（为 `components` 铺底），不适合单独作为文档主链路。

## 8. 方案 E：第三方插件 `@byyuurin/nitro-openapi`（不推荐）

npm 上检索到的唯一 Nitro 专用 OpenAPI 插件，但存在明显短板：

- **WIP（Work In Progress）状态**，README 自述不成熟；
- **面向 `nitropack`（v2）**，与本项目 Nitro v3 alpha 不匹配；
- 使用方式繁琐：需手动创建 nitro plugin，在 `beforeResponse` hook 中拦截 `/openapi.json` 请求做 `merge`，再在路由中手动 `register`——本质是「自己拼 spec」，不如官方内置能力。

**结论：不推荐，官方内置方案（A）已完全覆盖其目标。**

## 9. 方案 F：已有接口批量补齐 defineRouteMeta 的迁移路径

这是本项目（已有 5+ 接口、未写元数据）从「开启开关」到「高质量 OpenAPI JSON」的关键配套动作。三条可行路径：

1. **AI 逐路由补写（推荐，成本可控）**：让 AI 读取每个路由文件（现有 JSDoc 已含 `@file`、`@description`、`GET /xxx` 等信息），为每个文件补 `defineRouteMeta({ openAPI: {...} })` 块。本项目的 `defineApiHandler` 统一包装 + 现有 JSDoc 注释使 AI 补写准确率很高。补写后运行 `pnpm dev` 访问 `/_openapi.json` 回归验证。
2. **脚本半自动生成**：写一次性脚本，用 AST（如 `oxc-parser` / `ts-morph`）扫描 `server/routes/**/*.{method}.ts`，提取路由路径、方法、JSDoc 描述，生成 `defineRouteMeta` 骨架（responses 默认 `200 OK`），再由人工/AI 填充 schema 细节。
3. **渐进式**：先给核心接口补 meta，其余接口保留「裸 200」空壳，随开发节奏逐步补全。

## 10. 消费端工具链（拿到 OpenAPI JSON 之后）

用户诉求中「只要能生成 openapi json 就能找到其他工具生成 api 文档」——以下为验证过的消费端生态：

### 10.1 交互式文档 UI

|          工具          | 说明                         | 与 Nitro 集成方式                                   |
| :--------------------: | :--------------------------- | :-------------------------------------------------- |
|       **Scalar**       | 现代化 API 参考文档（内置）  | `/_scalar`，零配置，支持主题定制                    |
|     **Swagger UI**     | 经典交互式文档（内置）       | `/_swagger`，零配置，支持 `persistAuthorization` 等 |
|      **RapiDoc**       | 自定义能力强的文档组件       | 引入 CDN，指向 `/_openapi.json`                     |
|      **Redocly**       | Redoc 开源版 + CLI 校验/构建 | 指向 `/_openapi.json` 或本地文件                    |
| **Stoplight Elements** | 企业级文档组件               | 指向 `/_openapi.json`                               |

### 10.2 类型安全客户端 / 代码生成

|          工具          |                  方向                   | 说明                                                                                                                                        |
| :--------------------: | :-------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------ |
|       **apiful**       |    OpenAPI → TS 类型 + typed client     | 官方有 Nitro 专门教程（`npx apiful generate`，schema 指向 `http://localhost:8080/_openapi.json` 或构建产物 `.output/public/_openapi.json`） |
| **openapi-typescript** |            OpenAPI → TS 类型            | Etsy 等大厂实践验证                                                                                                                         |
|   **openapi-fetch**    |           类型安全 fetch 封装           | 与 openapi-typescript 配套                                                                                                                  |
|       **orval**        | OpenAPI → 各框架 client（React/Vue 等） | 全栈代码生成                                                                                                                                |
| **openapi-generator**  |      OpenAPI → 多语言服务端/客户端      | 通用代码生成器                                                                                                                              |

## 11. 本项目（learn-nitro-starter-with-vercel）落地建议

### 11.1 分步落地清单

| 步骤 | 动作                                                                                                  | 验证方式                                                                                                                  |
| :--: | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------ |
|  1   | `nitro.config.ts` 添加 `experimental: { openAPI: true }` + `openAPI.meta`                             | `pnpm dev` 后访问 `http://localhost:8080/_openapi.json`，应返回 OpenAPI 3.1.0 JSON（含 5 个路由的 path，schema 为裸 200） |
|  2   | 用方案 F 为现有 5 个路由补 `defineRouteMeta`（含 `$global` 定义 `User`、`ApiResponse` 系列 schema）   | 重新访问 `/_openapi.json`，确认 responses.schema 完整                                                                     |
|  3   | （可选）配置 `openAPI.ui.scalar`/`swagger` 主题与路径                                                 | 访问 `/_scalar`、`/_swagger` 确认 UI 渲染                                                                                 |
|  4   | （可选）接入 apiful 生成类型安全客户端                                                                | `npx apiful generate` 成功产出 `apiful.d.ts`                                                                              |
|  5   | （可选）CI 中产出静态 spec：`openAPI.production: "prerender"`，从 `.output/public/_openapi.json` 取用 | 构建后确认文件存在                                                                                                        |
|  6   | 版本治理：评估是否升级到 v3 beta 线（见第 12.2 节）                                                   | 升级后回归 `/_openapi.json` 与全部接口                                                                                    |

### 11.2 针对本项目架构的注意事项

1. **统一响应包装**：本项目 `defineApiHandler` 将响应包装为 `{ success, data, message? }`（见 `server/utils/api.ts`），OpenAPI 的响应 schema 必须体现这一包装结构。建议在 `$global` 中定义 `ApiResponse<T>` 模板 schema（如 `ApiResponseUserList`），避免每个路由重复写包装层。
2. **错误响应**：`defineApiHandler` 出错时返回 `{ success: false, message }`，可在 `responses` 中补充 `400/500` 描述或 `ErrorResponse` schema。
3. **导入规范**：`defineRouteMeta` 从 `nitro` 导入（不是 `nitro/h3`），与现有 `nitro/h3` 导入共存不冲突；注意遵守项目 use-nitro 技能「导入必须来自 `nitro/h3`」约束——该约束针对 handler 相关 API，`defineRouteMeta` 属 Nitro 构建期宏，官方文档即从 `nitro` 导入。
4. **JSDoc 一致性**：现有路由 JSDoc（`@file`/`@description`/`GET /xxx`）可保留，`defineRouteMeta` 的 `description`/`summary` 建议与之对齐，避免双份描述漂移。

## 12. 风险与注意事项

### 12.1 功能状态风险

|            风险             | 等级 | 说明                                                                            |
| :-------------------------: | :--: | :------------------------------------------------------------------------------ |
| OpenAPI 支持为 experimental |  中  | API 形态可能变化（beta 线已多次修复 route-meta 相关问题），升级版本需回归验证   |
|    无 meta 路由信息量低     |  中  | 裸 200 空壳不满足「文档质量」诉求，补齐 meta 是必做动作                         |
| `defineRouteMeta` 静态限制  |  低  | 不能用运行时变量构造 meta；`$global` 可缓解复用问题                             |
|        生产暴露风险         |  中  | 生产开启后 `/_openapi.json` 暴露全部路由；建议 `prerender` + 网关鉴权或内网隔离 |

### 12.2 版本升级建议

- 当前 `nitro@3.0.1-alpha.1`（2025 年 10 月-2026 年 1 月的 alpha 线）。
- v3 已进入 **日期式 beta 线**（如 `3.0.260522-beta`，2026-05-22 发布），官方口径「v3 beta track is considered stable for most workloads，稳定版 v3.0 在即」。
- **建议**：在本次 OpenAPI 落地验证通过后，评估升级到最新 beta（或等待 stable）。升级注意点：beta 线对 route-meta 去重、routing-meta import 去重等有修复（曾出现 handlers 重复导致 spec 异常），升级后务必回归 `/_openapi.json` 内容完整性。
- 升级命令参考：`pnpm up nitro`（或按项目惯例使用 `pnpm up-taze`），升级前用 `pnpm prepare` 重新生成类型。

### 12.3 其他提醒

- 若同时使用方案 B（swagger-jsdoc）与方案 A，注意用 `defu` 深合并两个 spec 源，避免相互覆盖。
- `/_openapi.json` 的 `servers` 字段来自 `getRequestURL(event).origin`，为请求时的源，跨环境部署时如需固定 server 地址需自行处理。

## 13. 参考资料

1. Nitro 官方文档 - OpenAPI：https://nitro.build/docs/openapi
2. Nitro 官方文档 - 配置（openAPI 配置项）：https://nitro.build/config
3. Nitro 官方文档 - 路由（Route Meta 章节）：https://nitro.build/guide/utils
4. nitrojs/nitro GitHub Discussion #170（swagger-jsdoc + 内置 openapi 合并实践）：https://github.com/nitrojs/nitro/discussions/170
5. APIful - Typed Client for Nitro Servers（v3 beta 教程，含 prerender 落盘技巧）：https://apiful.land/cookbook/typed-nitro-client
6. npm - @byyuurin/nitro-openapi（WIP 插件）：https://www.npmjs.com/package/@byyuurin/nitro-openapi
7. npm - @asteasolutions/zod-to-openapi：https://github.aichem.org/asteasolutions/zod-to-openapi
8. How I use Nitro（OpenAPI + defineRouteMeta + security 实践）：https://www.markbruderer.com/blog/nitro-tips
9. Nitro v3 beta 发布说明（3.0.260522-beta，route-meta 修复记录）：https://typescript.news/articles/2026-06-03-nitro-v3-0-260522-beta-tracing-vfs-vercel-queues
