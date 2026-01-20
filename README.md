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
