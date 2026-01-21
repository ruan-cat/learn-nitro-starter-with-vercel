# Nitro

This directory is a brief example of [Nitro](https://nitro.build/) that can be deployed to Vercel with zero configuration. Go to the [nitro quick start](https://nitro.unjs.io/guide#quick-start) to learn more.

## 学习加载更多新的东西

我已经学会 nitro V3 版本如何组织正式有效的接口了。接下来需要使用该仓库学习更多和全栈相关的知识。

- neon 数据库
- drizzle ORM

## 环境要求

- Node.js >= 20
- 使用 Nitro v3（依赖包已从 `nitropack` 更名为 `nitro`）

## Deploy Your Own

Deploy your own Nitro project with Vercel.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/vercel/examples/tree/main/framework-boilerplates/nitro&template=nitro)

Live Example: https://nitro-template.vercel.app/

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev
```

## 初始化项目

先用 vercel 提供的官方模板，走通整个流程。

- https://vercel.com/docs/frameworks/backend/nitro

再用 nitro 提供的模板，迁移缺少的配置文件。

```bash
pnpm dlx giget@latest nitro nitro-app --install
```

## 导入到 cloudflare worker 内配置部署

- 构建命令： `corepack use pnpm@latest && pnpm build:cloudflare`
- 部署命令： `npx wrangler deploy .output/server/index.mjs --assets .output/public`

## package.json 各个命令的说明

### 1. 开发与构建命令

|          命令           |                        说明                        |
| :---------------------: | :------------------------------------------------: |
|       `pnpm dev`        | 启动 Nitro 开发服务器，默认运行在 `localhost:8080` |
|      `pnpm build`       |        构建生产版本（默认使用 Vercel 预设）        |
|   `pnpm build:vercel`   |            使用 Vercel 预设构建生产版本            |
| `pnpm build:cloudflare` |      使用 Cloudflare Workers 预设构建生产版本      |
|     `pnpm prepare`      |      生成 Nitro TypeScript 类型（`.nitro/`）       |
|     `pnpm preview`      |           预览生产构建（从 `.output/`）            |

### 2. 环境变量命令

|      命令       |                          说明                          |
| :-------------: | :----------------------------------------------------: |
| `pnpm env:pull` | 从 Vercel 拉取环境变量到本地 `.env` 文件（需先登录）   |

#### 2.1. 使用场景

**场景：首次克隆项目后获取环境变量**

```bash
# 1. 安装 Vercel CLI（如未安装）
pnpm add -g vercel

# 2. 登录 Vercel
vercel login

# 3. 链接项目（如未链接）
vercel link

# 4. 拉取环境变量
pnpm env:pull
```

> 注意：`vercel env pull` 会将 Vercel 项目中配置的环境变量下载到本地 `.env` 文件，包括 `DATABASE_URL` 等敏感信息。

### 3. 部署命令

|           命令           |              说明               |
| :----------------------: | :-----------------------------: |
| `pnpm deploy:cloudflare` | 使用 wrangler 部署到 Cloudflare |

### 4. 数据库命令（Drizzle Kit）

Drizzle Kit 是 Drizzle ORM 的 CLI 工具，用于管理数据库迁移和 Schema。

|        命令        |                            说明                            |
| :----------------: | :--------------------------------------------------------: |
| `pnpm db:generate` | 根据 `schema.ts` 的变更生成 SQL 迁移文件到 `drizzle/` 目录 |
| `pnpm db:migrate`  |              将生成的迁移文件应用到真实数据库              |
|   `pnpm db:push`   |    直接将 Schema 推送到数据库（跳过迁移文件，仅开发用）    |
|  `pnpm db:studio`  |          启动 Drizzle Studio 可视化界面管理数据库          |
|   `pnpm db:drop`   |                   删除最近生成的迁移文件                   |

#### 4.1. 命令使用场景

**场景一：首次初始化数据库**

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 DATABASE_URL

# 2. 生成迁移文件
pnpm db:generate

# 3. 执行迁移
pnpm db:migrate
```

**场景二：修改表结构后更新数据库**

```bash
# 1. 修改 server/db/schema.ts

# 2. 生成新的迁移文件
pnpm db:generate

# 3. 应用迁移
pnpm db:migrate
```

**场景三：快速开发调试（不需要迁移记录）**

```bash
# 直接同步 Schema 到数据库（会丢失迁移历史）
pnpm db:push
```

**场景四：可视化查看和编辑数据**

```bash
# 启动 Drizzle Studio
pnpm db:studio
# 浏览器访问 https://local.drizzle.studio
```

### 5. 工具命令

|      命令      |               说明               |
| :------------: | :------------------------------: |
| `pnpm up-taze` | 更新依赖并运行 taze 检查可用更新 |

## 官方文档链接

### Nitro

- Nitro 官网：https://nitro.build/
- Nitro 快速开始：https://nitro.unjs.io/guide#quick-start
- Nitro 路由：https://nitro.build/guide/routing

### Drizzle ORM

- Drizzle ORM 官网：https://orm.drizzle.team/
- Drizzle Kit 概览：https://orm.drizzle.team/docs/kit-overview
- Drizzle Kit Generate：https://orm.drizzle.team/docs/drizzle-kit-generate
- Drizzle Kit Migrate：https://orm.drizzle.team/docs/drizzle-kit-migrate
- Drizzle Kit Push：https://orm.drizzle.team/docs/drizzle-kit-push
- Drizzle Kit Studio：https://orm.drizzle.team/docs/drizzle-kit-studio
- Drizzle Kit Drop：https://orm.drizzle.team/docs/drizzle-kit-drop
- Drizzle + Neon 教程：https://orm.drizzle.team/docs/tutorials/drizzle-with-neon

### Neon

- Neon 官网：https://neon.tech/
- Neon 文档：https://neon.tech/docs
- Neon Serverless Driver：https://neon.tech/docs/serverless/serverless-driver

### Vercel

- Vercel + Nitro 部署：https://vercel.com/docs/frameworks/backend/nitro
- Vercel 环境变量：https://vercel.com/docs/projects/environment-variables
- Vercel CLI：https://vercel.com/docs/cli
- Vercel CLI env pull：https://vercel.com/docs/cli/env

### Cloudflare

- Cloudflare Workers：https://developers.cloudflare.com/workers/
- Wrangler CLI：https://developers.cloudflare.com/workers/wrangler/
