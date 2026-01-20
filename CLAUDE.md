# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此仓库中工作的指导。

## 项目概述

这是一个 Nitro v3 入门项目，设计用于部署到 Vercel 或 Cloudflare Workers。Nitro 是一个用于构建 Web 服务器和 API 的通用服务器框架。

**核心框架：** Nitro v3（注意：v3 版本中包名从 `nitropack` 改为 `nitro`）

**Node.js 要求：** >= 22.14.0

**包管理器：** pnpm 10.24.0（通过 Corepack 管理）

## 开发命令

### 启动开发服务器

```bash
pnpm dev
# 运行在 http://localhost:8080（在 nitro.config.ts 中配置）
```

### 生产环境构建

```bash
# Vercel（默认）
pnpm build
# 或明确指定
pnpm build:vercel

# Cloudflare Workers
pnpm build:cloudflare
```

### 预览生产构建

```bash
pnpm preview
# 从 .output/server/index.mjs 运行构建后的服务器
```

### 部署到 Cloudflare

```bash
pnpm deploy:cloudflare
# 从 .output 目录运行 wrangler deploy
```

### 准备 Nitro 类型

```bash
pnpm prepare
# 在 .nitro/types/ 中生成 TypeScript 类型
```

### 更新依赖

```bash
pnpm up-taze
# 更新 @ruan-cat/taze-config 并运行 taze 检查依赖更新
```

## 架构设计

### 基于文件的路由

Nitro 在 `server/` 目录中使用基于文件的路由：

- `server/routes/*.{get,post,put,delete}.ts` - API 路由自动映射到 HTTP 方法
- 示例：`server/routes/user.get.ts` 创建一个 GET 端点 `/api/user`

### 服务端目录结构

```
server/
└── routes/           # API 路由（基于文件的路由）
    └── *.{method}.ts # 按 HTTP 方法命名的路由文件
```

### 配置说明

**nitro.config.ts** - Nitro 主配置文件：

- `preset` 应在构建命令中指定，而非配置文件中
- `compatibilityDate: "latest"` - 使用最新的兼容性特性
- `imports: false` - 禁用自动导入
- `serverDir: "server"` - 服务器代码位置
- `cloudflare.wrangler.name` - Cloudflare Worker 名称设置为 `learn-nitro-starter-with-vercel`

### 事件处理器

所有路由处理器使用 `nitro/h3` 中的 `eventHandler`：

```typescript
import { eventHandler } from "nitro/h3";

export default eventHandler((event) => {
  return {
    /* 响应数据 */
  };
});
```

### 构建输出

构建产物生成在 `.output/` 目录：

- `.output/server/` - 服务器打包文件
- `.output/public/` - 静态资源

## TypeScript 配置

- 扩展 `.nitro/types/tsconfig.json`（由 `pnpm prepare` 生成）
- 启用严格模式和额外的安全检查
- 模块解析：Bundler
- 目标：ESNext
- JSX 支持配置（工厂函数：`h`，片段：`Fragment`）

## 部署方式

### Vercel

- 零配置部署
- 构建命令中使用 `--preset=vercel`
- 通过 Vercel CLI 或 Git 集成部署

### Cloudflare Workers

- 构建命令：`corepack use pnpm@latest && pnpm build:cloudflare`
- 使用 `--preset=cloudflare_module`
- 配置了 Node.js 兼容性（`nodeCompat: true`）
- 使用 wrangler 从 `.output/` 目录部署

## 开发工具

- **commitlint** - 使用 `@ruan-cat/commitlint-config` 进行提交信息校验
- **commitizen/cz-git** - 交互式提交工具（通过 `.czrc` 配置）
- **taze** - 使用 `@ruan-cat/taze-config` 进行依赖更新检查
- **rolldown** - 构建工具（测试版）

## 学习目标（来自 README）

本项目作为学习环境，用于学习：

- Neon 数据库集成
- Drizzle ORM
- 使用 Nitro 进行全栈开发
