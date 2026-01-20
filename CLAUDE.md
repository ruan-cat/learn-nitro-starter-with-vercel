# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此仓库中工作的指导。

## 1. 主动问询实施细节

在我与你沟通并要求你具体实施更改时，难免会遇到很多模糊不清的事情。

请你深度思考这些`遗漏点`，`缺漏点`，和`冲突相悖点`，**并主动的向我问询这些你不清楚的实施细节**。

我会与你共同补充细化实现细节。我们先迭代出一轮完整完善的实施清单，然后再由你亲自落实实施下去。

## 5. 代码/编码格式要求

### 5.1. markdown 文档的 table 编写格式

每当你在 markdown 文档内编写表格时，表格的格式一定是**居中对齐**的，必须满足**居中对齐**的格式要求。

### 5.2. markdown 文档的 vue 组件代码片段编写格式

错误写法：

1. 代码块语言用 vue，且不带有 `<template>` 标签来包裹。

```vue
<wd-popup v-model="showModal">
  <wd-cell-group>
    <!-- 内容 -->
  </wd-cell-group>
</wd-popup>
```

2. 代码块语言用 html。

```html
<wd-popup v-model="showModal">
  <wd-cell-group>
    <!-- 内容 -->
  </wd-cell-group>
</wd-popup>
```

正确写法：代码块语言用 vue ，且带有 `<template>` 标签来包裹。

```vue
<template>
  <wd-popup v-model="showModal">
    <wd-cell-group>
      <!-- 内容 -->
    </wd-cell-group>
  </wd-popup>
</template>
```

### 5.3. javascript / typescript 的代码注释写法

代码注释写法应该写成 jsdoc 格式。而不是单纯的双斜杠注释。比如：

不合适的双斜线注释写法如下：

```ts
// 模拟成功响应
export function successResponse<T>(data: T, message: string = "操作成功") {
  return {
    success: true,
    code: ResultEnum.Success,
    message,
    data,
    timestamp: Date.now(),
  };
}
```

合适的，满足期望的 jsdoc 注释写法如下：

```ts
/** 模拟成功响应 */
export function successResponse<T>(data: T, message: string = "操作成功") {
  return {
    success: true,
    code: ResultEnum.Success,
    message,
    data,
    timestamp: Date.now(),
  };
}
```

### 5.4. unocss 配置不应该创建过多的 shortcuts 样式类快捷方式

在你做样式迁移的时候，**不允许滥用** unocss 的 shortcuts 功能。不要把那么多样式类都设计成公共全局级别的快捷方式。

### 5.5. vue 组件编写规则

1. vue 组件命名风格，使用短横杠的命名风格，而不是大驼峰命名。
2. 先 `<script setup lang="ts">`、然后 `<template>`、最后是 `<style scoped>` 。
3. 每个 vue 组件的最前面，提供少量的 html 注释，说明本组件是做什么的。

### 5.6. jsdoc 注释的 `@example` 标签不要写冗长复杂的例子

1. 你应该积极主动的函数编写 jsdoc 注释的 `@example` 标签。
2. 但是 `@example` 标签不允许写复杂的例子，请写简单的单行例子。完整的函数使用例子，你应该择机在函数文件的附近编写 md 文档，在文档内给出使用例子。

### 5.7. 页面 vue 组件必须提供注释说明本组件的`业务名`和`访问地址`

比如以下的这几个例子：

```html
<!--
  房屋申请列表页
  功能：显示房屋申请列表，支持搜索和筛选

  访问地址: http://localhost:9000/#/pages-sub/property/apply-room
-->
```

```html
<!--
  房屋申请详情页
  功能：显示房屋申请详细信息，支持验房和审核操作

  访问地址: http://localhost:9000/#/pages-sub/property/apply-room-detail
  建议携带参数: ?ardId=xxx&communityId=xxx

  http://localhost:9000/#/pages-sub/property/apply-room-detail?ardId=ARD_002&communityId=COMM_001

-->
```

每个页面都必须提供最顶部的文件说明，说明其业务名称，提供访问地址。

### 5.8. markdown 的多级标题要主动提供序号

对于每一份 markdown 文件的二级标题、三级标题和四级标题，你都应该要：

1. 主动添加**数字**序号，便于我阅读文档。
2. 主动**维护正确的数字序号顺序**。如果你处理的 markdown 文档，其手动添加的序号顺序不对，请你及时的更新序号顺序。

## 6. 报告编写规范

在大多数情况下，你的更改是**不需要**编写任何说明报告的。但是每当你需要编写报告时，请你首先遵循以下要求：

- 报告地址： 默认在 `docs\reports` 文件夹内编写报告。
- 报告文件格式： `*.md` 通常是 markdown 文件格式。
- 报告文件名称命名要求：
  1. 前缀以日期命名。包括年月日。日期格式 `YYYY-MM-DD` 。
  2. 用小写英文加短横杠的方式命名。
- 报告的一级标题： 必须是日期`YYYY-MM-DD`+报告名的格式。
  - 好的例子： `2025-12-09 修复 @ruan-cat/commitlint-config 包的 negation pattern 处理错误` 。前缀包含有 `YYYY-MM-DD` 日期。
  - 糟糕的例子： `构建与 fdir/Vite 事件复盘报告` 。前缀缺少 `YYYY-MM-DD` 日期。
- 报告日志信息的代码块语言： 一律用 `log` 作为日志信息的代码块语言。如下例子：

  ````markdown
  日志如下：

  ```log
  日志信息……
  ```
  ````

- 报告语言： 默认用简体中文。

## 13. <!-- https://github.com/GuDaStudio/geminimcp --> Core Instruction for Gemini MCP

在任何时刻，你必须思考当前过程可以如何与 gemini 进行协作，如何调用 gemini 为你提供的 MCP 工具作为你**客观全面分析**的保障。

其中你**务必执行**以下几个步骤：

**1** 在你对用户需求**形成初步分析后**，
（1）首先将用户**原始需求（一字不差，严禁转述）**、以及你的初始思路告知 gemini；
（2）与 gemini 进行**充分讨论、辩驳**，以完善需求分析和实施计划。这一步的结束标志为，**必须**确保对用户需求的透彻理解，并**生成切实可行的行动计划**。

**2** 在实施具体编码任务前，你**必须向 gemini 索要代码实现原型**（要求 gemini 仅给出 unified diff patch，严禁对代码做任何真实修改）。在获取代码原型后，你**只能以此为逻辑参考，再次对代码修改进行重写**，形成企业生产级别、可读性极高、可维护性极高的代码后，才能实施具体编程修改任务。

- **注意：** Gemini 十分擅长前端代码，并精通样式、UI 组件设计。在涉及前端代码时，你必须向其索要代码原型（CSS/React/Vue/HTML 等前端代码），任何时刻，你**必须以 gemini 的前端设计（原型代码）为最终的前端代码基点**。
- 例如，当你识别到用户给出了前端设计需求，你的首要行为必须自动调整为，将用户需求原封不动转发给 gemini，并让其出具代码示例（此阶段严禁对用户需求进行任何改动、简写等等）。即你必须从 gemini 获取代码基点，才可以进行接下来的各种行为。

## 14. <!-- https://github.com/GuDaStudio/geminimcp --> Gemini Tool Invocation Specification

1.  工具概述

gemini MCP 提供了一个工具 `gemini`，用于调用 Google Gemini 模型执行 AI 任务。该工具拥有极强的前端审美、任务规划与需求理解能力，但在**上下文长度（Effective 32k）**上有限制。

2. 使用方式与规范

   **必须遵守的限制**：

- **会话管理**：捕获返回的 `SESSION_ID` 用于多轮对话。
- **后端避让**：严禁让 Gemini 编写复杂的后端业务逻辑代码。

**擅长场景（必须优先调用 Gemini）**：

- **需求清晰化**：在任务开始阶段辅助生成引导性问题。
- **任务规划**：生成 Step-by-step 的实施计划。
- **前端原型**：编写 CSS、HTML、UI 组件代码，调整样式风格。

## 15. 使用 `gemini MCP` 或直接使用 `gemini` 时需要额外主动获取上下文

1. 在使用 `gemini MCP` 或直接使用 `gemini` 时，由于传递信息的关系，gemini 是不会主动的先阅读来自 claude code 的配置文件的，因此你必须要告诉 gemini，并约束 gemini 的上下文读取行为，**必须要求**gemini 首先要无条件的阅读 claude code 的上下文。
2. 请务必先主动阅读 `CLAUDE.md` 和 `.claude` 目录内的全部的指导文件。
3. 不需要你阅读以下文件：
   - .claude\settings.json
   - .claude\statusline.sh
4. 你的修改必须按照这些 claude code 文档的要求和约束来做。特别是 `agents` 和 `skills` 的要求。

## 16. 获取技术栈对应的上下文

### 16.2. claude code skill

- 编写语法与格式： https://code.claude.com/docs/zh-CN/skills
- 最佳实践： https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices
- 规范文档： https://agentskills.io/home

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
