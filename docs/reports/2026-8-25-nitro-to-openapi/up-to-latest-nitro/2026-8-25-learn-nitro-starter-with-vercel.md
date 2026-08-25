# 2026-8-25 learn-nitro-starter-with-vercel nitro 升级风险与计划

> **元信息**
>
> - 本报告由 WorkBuddy（AI agent 工具）调研生成
> - AI 模型：探索子代理（低配）+ 编辑子代理（低配）
> - 日期：2026-08-25
> - 任务类型：升级风险调研与计划文档（非升级执行）

## 1. 结论摘要（TL;DR）

- 本仓库 nitro 将从 **3.0.1-alpha.1** 升级到 **3.0.260610-beta**（npm dist-tag `latest`，2026-06-10 发布，已核实为最新版本；存在 3.0.0 stable 占位发布但无 dist-tag 指向，**不建议使用**）。
- 内嵌 h3 从 **2.0.1-rc.5** → **2.0.1-rc.22**，是本仓库**跨度最大的单项变更**，`defineHandler` / `HTTPError` 存在编译级影响风险。
- 项目有 5 个 API 路由，全部经 `server/utils/api.ts` 的 `defineApiHandler` 统一包装（基于 `defineHandler`），升级影响面收敛、可控，但**签名验证必须前置**。
- 无测试、无 CI，回归全部依赖手动 build + curl，**验证清单要写死、逐条执行**。
- 建议升级路径：改 pin → 重装 lockfile → `build:vercel` 冒烟 → `build:cloudflare` 链路 → 核对导出签名 → 对照官方 config 文档核对配置项；可顺带开启 `experimental.openAPI` 验证 `/_openapi.json` 作为回归手段之一（可选）。

|  关键项  |               现状               |          目标          |          等级          |
| :------: | :------------------------------: | :--------------------: | :--------------------: |
|  nitro   | 3.0.1-alpha.1（devDependencies） |    3.0.260610-beta     |   🔴 高（跨度最大）    |
| 内嵌 h3  |            2.0.1-rc.5            |      2.0.1-rc.22       |   🔴 高（签名变化）    |
| rolldown |    1.0.0-beta.53（显式固定）     | 与 260610 内置版本协调 | 🟡 中（冲突/重复安装） |
| 回归手段 |           无测试无 CI            |   手动 build + curl    |   🟢 低（人工成本）    |

## 2. 项目现状

### 2.1 版本与依赖

|           依赖           |   当前版本    |                    说明                     |
| :----------------------: | :-----------: | :-----------------------------------------: |
|          nitro           | 3.0.1-alpha.1 |            位于 devDependencies             |
|         内嵌 h3          |  2.0.1-rc.5   |                随 nitro 内置                |
|       drizzle-orm        |    ^0.38.4    |                     ORM                     |
| @neondatabase/serverless |   （存在）    |               Neon 无服务驱动               |
|         rolldown         | 1.0.0-beta.53 | **显式固定版本**，与 nitro 内置捆绑可能冲突 |
|         wrangler         |    ^4.59.3    |               Cloudflare 部署               |

### 2.2 nitro 配置现状

|                        配置项                        |                             当前值                              |               备注               |
| :--------------------------------------------------: | :-------------------------------------------------------------: | :------------------------------: |
|                  compatibilityDate                   |          对象形式：cloudflare / vercel 各 `2024-09-19`          | 需确认 260610 是否仍支持对象形式 |
|                      serverDir                       |                           `"server"`                            |                —                 |
|                       imports                        |                             `false`                             |       需确认 260610 兼容性       |
|                    devServer.port                    |                             `8080`                              |       需确认 260610 兼容性       |
| cloudflare.deployConfig / nodeCompat / wrangler.name |                             已配置                              |    属 cloudflare preset 配置     |
|                        preset                        | 走 build 命令：`--preset=vercel` / `--preset=cloudflare_module` |        未写死到配置文件中        |

### 2.3 handler 组织

- 共 **5 个路由**，位于 `server/routes/api/`。
- 全部经 `server/utils/api.ts` 的 `defineApiHandler` 包装，底层基于 `defineHandler`。
- 从 `nitro/h3` 导入：`defineHandler`、`HTTPError`、`readBody`、`H3Event`。
- 路由文件带 JSDoc 注释。

### 2.4 部署方式

|    平台    |                               命令                                |         说明         |
| :--------: | :---------------------------------------------------------------: | :------------------: |
|   Vercel   |   `build:vercel`（preset=vercel）+ `preview`（`node .output`）    | 本地预览走 node 产物 |
| Cloudflare | `build:cloudflare`（preset=cloudflare_module）+ `wrangler deploy` |          —           |

> 无 `vercel.json`、无 `wrangler.toml`，部署行为完全由 build 命令 + nitro 配置决定。

## 3. 升级风险清单

### 3.1 通用 breaking changes 清单（E1 探索结论，本报告及配套 01s-11comm 报告通用）

|                                                           变更点                                                           |              影响               |        风险等级         |                         应对                         |
| :------------------------------------------------------------------------------------------------------------------------: | :-----------------------------: | :---------------------: | :--------------------------------------------------: |
|                            移除 custom moduleSideEffects config（260415 #4164，官方 breaking）                             |     删除该键后构建行为变化      |          🔴 高          |           删除该键，改用 rolldown 原生能力           |
|                 preset 重命名（cloudflare→cloudflare_module、vercel-edge→vercel、node→node_middleware 等）                 |  使用旧名则 preset 不生效/报错  |    🔴 高（若用旧名）    |             按官方重命名表更新 preset 名             |
|                                cloudflare env bindings：`event.context.cloudflare.env` 失效                                |  CF preset 下环境变量读取崩溃   | 🔴 高（若用 CF preset） | 全局替换为 `event.req.runtime.cloudflare.env` 并回归 |
| 依赖大换血：h3 2.0.1-rc.22、unstorage 2.0.0-alpha.7、unenv 2.0.0-rc.24、rolldown ^1.1.0；engines `^20.19.0 \|\| >=22.12.0` | 底层行为变化，Node 版本要求提高 |          🟡 中          |        锁定 Node 版本（≥20.19.0 或 ≥22.12.0）        |
|                    rolldown 配置变更：alpha.2 迁移 codeSplitting、260311 移除废弃 inlineDynamicImports                     |          旧配置项失效           |          🟡 中          |                     逐项核对配置                     |
|                                                ocache 迁移（260311 #4087）                                                 |          旧缓存不可用           |          🟡 中          |                 清理旧缓存并验证读写                 |
|                       defineEventHandler → defineHandler（v3 全系基于 h3 v2，旧名仍 re-export 兼容）                       |     旧 API 仍可用但建议迁移     |          🟡 中          |   优先使用 defineHandler；createError → HTTPError    |
|                             web-standard event.req（readBody 等 util 让位 `event.req.json()`）                             |       读取 body 方式变化        |          🟡 中          |               统一改用原生 Request API               |
|                                         route-meta handler 去重修复（#4119/#4120）                                         |       多路由场景输出变化        |          🟢 低          |                  多路由项目核对产物                  |
|                    顶层 `routes/` 优先，`server/` 部分兼容（260610 #4313 支持从 `server/` 解析 entry）                     |        入口解析路径变化         |          🟡 中          |              验证 `server.ts` 入口解析               |
|                        storage/unstorage、runtimeConfig、compatibilityDate、openapi/defineRouteMeta                        |          无破坏性变化           |          🟢 低          |                     正常回归即可                     |

### 3.2 本项目针对性风险清单（E2 结论）

|          风险点           |                                                                                                                                                                                        说明                                                                                                                                                                                        | 风险等级 |                                       应对                                        |
| :-----------------------: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------: | :-------------------------------------------------------------------------------: |
| h3 rc.5 → rc.22 签名变化  | `defineHandler` / `HTTPError` 存在编译级影响，直接作用于 `defineApiHandler` 包装层。仓库原有 `h3_rc22_tmp` / `nitro_260610_tmp` 对比包；**导出面预检已完成**：h3 2.0.1-rc.22 仍导出 `defineHandler` / `HTTPError`（`defineEventHandler` 保留兼容导出），nitro 3.0.260610-beta 的 exports 仍含 `./h3`、`./runtime-config` 子路径——`nitro/h3` 导入写法兼容，签名级差异需实际构建验证 |  🔴 高   | 导出面已确认兼容；改包后直接跑 `build:vercel` 验证签名级兼容（详见 4.1 预检结论） |
| rolldown 显式固定版本冲突 |                                                                                                                                               `rolldown@1.0.0-beta.53` 与 260610 内置 rolldown（^1.1.0）冲突，可能重复安装或版本覆盖                                                                                                                                               |  🟡 中   |               评估是否放开显式 pin，交给 nitro 内置版本；或显式对齐               |
|       配置项兼容性        |                                                                                                                                                `compatibilityDate` 对象形式、`imports:false`、`devServer.port` 在 260610 是否仍支持                                                                                                                                                |  🟡 中   |                  对照官方 config 文档逐一核对，build 后观察告警                   |
|        无测试无 CI        |                                                                                                                                                                         回归只能手动 build + curl，易漏检                                                                                                                                                                          |  🟢 低   |                        固定验收命令清单，逐条执行并贴输出                         |

## 4. 危险点聚焦（最高优先 3 项）

### 4.1 h3 签名变化：`defineHandler` / `HTTPError` 编译级影响（🔴 高）

本仓库所有路由都经由 `server/utils/api.ts` 的 `defineApiHandler` 包装，底层依赖 `defineHandler`；错误处理依赖 `HTTPError`。若 h3 rc.22 对二者做了签名调整（参数顺序、返回类型、构造器签名），**一个文件编译不过就会整条链路失败**。这是本次升级唯一的硬阻断项。

- 已有先行动作：仓库内存在 `h3_rc22_tmp` / `nitro_260610_tmp` 对比包，已做导出面预检（结论见下）。
- **预检结论（源自 `h3_rc22_tmp` / `nitro_260610_tmp`，2026-08-25 提取）**：
  - `h3@2.0.1-rc.22` 的类型导出（`dist/index.d.mts`）中，`defineHandler`（7 处）、`HTTPError`（12 处）均存在，`defineEventHandler`（2 处）仍保留兼容导出 → 本项目 `nitro/h3` 导入写法兼容。
  - `nitro@3.0.260610-beta` 的 `package.json` exports 含 `./h3`、`./runtime-config`、`./types` 等子路径 → 从 `nitro/h3` 导入 `defineHandler` / `HTTPError` / `readBody` / `H3Event` 的路径在 260610 仍有效。
  - 局限：上述为**导出面静态预检**（导出名/子路径存在性），不等于 TS 签名逐参数一致；签名级结论以实际 `pnpm install` 后 `build:vercel` 编译结果为准。
- 建议：升级时直接改 pin 后跑构建，用编译结果兜底签名级验证。

### 4.2 rolldown 显式固定版本与 260610 内置版本冲突（🟡 中）

`rolldown@1.0.0-beta.53` 是显式固定依赖。260610 依赖 rolldown ^1.1.0，pnpm 很可能在 node_modules 中同时存在两套 rolldown，导致**打包器实例不一致**、配置不生效或产物异常。需要判断是否继续显式固定，还是移除 pin 交给 nitro 内置。

### 4.3 配置项在 260610 的兼容性（🟡 中）

`compatibilityDate` 采用**对象形式**（cloudflare / vercel 各一个日期）、`imports:false`、`devServer.port:8080` 三项，均属 alpha.1 写法。260610 对配置 schema 是否收敛为单一字符串/默认值，需对照官方 config 文档确认；build 阶段注意 warning 输出。

## 5. 升级计划（分步可执行）

### 5.1 升级前准备

1. ~~核对对比包导出签名~~（**已完成**：见 4.1 预检结论——`defineHandler`/`HTTPError`/`defineEventHandler` 均存在于 h3 rc.22 类型导出，`nitro/h3` 与 `nitro/runtime-config` 子路径存在于 260610 exports；签名级由构建兜底）。
2. 确认本机 Node 版本满足 engines：`^20.19.0 || >=22.12.0`。

### 5.2 修改依赖

3. 修改 `package.json`，将 nitro devDependency pin 到 `3.0.260610-beta`。
4. 处理 rolldown：优先**移除显式 pin**，让 nitro 内置 rolldown 生效；若必须保留，显式对齐到 260610 内置版本（^1.1.0）。

### 5.3 重装与构建

5. 执行 `pnpm install`，重生成 lockfile；检查 node_modules 中是否残留双版本 rolldown。
6. 本地跑 `build:vercel`，观察构建告警（重点关注 compatibilityDate / imports / devServer.port / preset 相关 warning）。
7. 本地 `preview`（`node .output`）后对 5 个 `/api/*` 路由逐一 `curl` 冒烟，**重点验证 `defineApiHandler` 返回值包装与 vercel 产物**。

### 5.4 Cloudflare 链路

8. 跑 `build:cloudflare`（preset=cloudflare_module）全链路。
9. 确认 `event.context.cloudflare.env` 已被替换为 `event.req.runtime.cloudflare.env`（本项目若未使用则跳过，回归时确认即可）。
10. 本地 `wrangler deploy` 到测试环境验证。

### 5.5 收尾核对

11. 核对 nitro/h3 导出的 `defineHandler` / `HTTPError` 签名与 5.1 的 diff 结论一致。
12. 参考官方 config 文档核对 `compatibilityDate` / `imports` / `devServer.port` 三项配置。
13. （可选）开启 `experimental.openAPI`，本地 dev 后请求 `/_openapi.json`，作为升级后的回归手段之一。alpha.1 已内置 openapi 模块，本地已验证可用。

## 6. 验证方式（命令）

```bash
# 0. Node 版本核对
node -v   # 期望 ^20.19.0 || >=22.12.0

# 1. 重装
pnpm install

# 2. Vercel 链路
pnpm build:vercel
pnpm preview        # node .output
# 冒烟 curl（示例，按实际路由补全）
curl -i http://localhost:3000/api/<route1>
curl -i http://localhost:3000/api/<route2>

# 3. Cloudflare 链路
pnpm build:cloudflare
npx wrangler deploy --dry-run   # 先 dry-run，确认产物

# 4.（可选）OpenAPI 回归
pnpm dev
curl -s http://localhost:8080/_openapi.json | head -50
```

> 无自动化测试与 CI，以上命令**逐条执行并保留输出**作为升级闭环证据。

## 7. 注意事项 / 参考

- **不要使用 3.0.0 stable 占位发布**：它只是占位版本，无 dist-tag 指向；dist-tag `latest` 即 3.0.260610-beta，认准后者。
- 通用 breaking changes 清单（本报告 3.1）适用于所有待升级 nitro 仓库，01s-11comm 升级请同步引用。
- 仓库原有 `h3_rc22_tmp` / `nitro_260610_tmp` 对比包，其导出面结论已沉淀至本报告 4.1 节（预检结论）后，临时包已清理（npm 可随时重新获取，非独有信息）。
- 无 `vercel.json` / `wrangler.toml`，preset 完全由 build 命令决定，升级后命令行为不得隐式变化。
- 升级过程中发现任何与 3.1 清单不一致的行为，先回到 h3/nitro 官方 changelog 核对，再决定是否改配置。
