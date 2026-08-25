# 2026-8-25 ruan-cat 名下项目 nitro 版本使用情况盘点

> 本报告由 WorkBuddy（AI agent 工具）调研生成，采用 agent team 蜂群架构（2 个探索子代理 + 1 个复核子代理并行执行），AI 模型：探索子代理（低配模型）+ 复核子代理（中配模型）+ 主代理（汇总撰写）。
> 调研日期：2026-08-25。
> 调研范围：`D:\code\ruan-cat` 下全部 22 个顶层项目目录、122 个 package.json（排除 node_modules/.output/.next/dist/.git），全量基线命中 7 个 nitro/nitropack 相关文件，经复核子代理交叉验证无遗漏。

## 1. 结论摘要

1. **ruan-cat 名下所有项目的 nitro 直接依赖全部是 Nitro v3（包名 `nitro`），没有任何项目直接依赖 Nitro v2（包名 `nitropack`）**。唯一的 v2 出现是 `SmallAliceWeb` 中由 `nuxt@3.21.2` 传递引入的 `nitropack@2.13.3`（非直接依赖）。
2. **Nitro v3 版本差距横跨两条版本线**：
   - `3.0.1-alpha.x` 线（本项目 `3.0.1-alpha.1`、01s-11comm 系 `3.0.1-alpha.2`）；
   - `3.0.YYMMDD-beta` 日期式 beta 线（`3.0.260311-beta`、`3.0.260610-beta`）。
   - 全盘最新为 `3.0.260610-beta`（2026-06-10 前后发布），与当前项目 `3.0.1-alpha.1`（2025 年末发布）存在**约 5~7 个月的迭代差距**。
3. **版本分布**：7 个直接依赖声明中，alpha.1 有 1 个、alpha.2 有 2 个、260311-beta 有 1 个、260610-beta 有 3 个。
4. **本项目（learn-nitro-starter-with-vercel）在全盘中的位置**：版本最旧（`3.0.1-alpha.1`），但差距仅在一个 alpha 补丁（相对 01s-11comm 的 alpha.2）与一个版本线跨度（相对 beta 线）之内，且 openapi 能力在 alpha.1 已可用（见同目录《2026-8-25-nitro-to-openapi.md》）。

## 2. 扫描方法与证据链

### 2.1 扫描流程（蜂群分工）

|  环节   |         执行者         | 工作内容                                                            | 结果              |
| :-----: | :--------------------: | :------------------------------------------------------------------ | :---------------- |
|  基线   |         主代理         | 全量 `find` 122 个 package.json；grep 定位 nitro/nitropack          | 命中 7 个文件     |
| 探索 A1 | 探索子代理（低配模型） | 读取 01s-11comm 根、apps/api、01s-11comm-app 的声明 + lockfile 解析 | 3 个项目，全为 v3 |
| 探索 A2 | 探索子代理（低配模型） | 读取 SmallAliceWeb / main-sync / monorepo 的声明 + lockfile 解析    | 4 个文件，全为 v3 |
| 复核 B  | 复核子代理（中配模型） | 独立重读 7 个 package.json + 5 份 lockfile + 全量防漏 grep          | **PASS**，无遗漏  |

### 2.2 防漏验证

```log
# 全量基线 grep（排除 node_modules/.output/.next/dist/.git）
命中 7 个 package.json：
  01s-11comm-app/package.json
  01s-11comm/apps/api/package.json
  01s-11comm/package.json
  SmallAliceWeb-main-sync/packages/ai-rag-api/package.json
  SmallAliceWeb/packages/ai-rag-api/package.json
  learn-nitro-starter-with-vercel/package.json
  monorepo/packages/skill-router-mcp/package.json
# 复核子代理独立重跑：命中数仍为 7，无第 8 个，结论一致
```

## 3. 版本全景表（核心交付）

|                  项目 / 路径                  |   项目类型    | 技术栈简述                                            |     声明版本      |    依赖类型     |     lockfile 实际解析     |     版本线      |
| :-------------------------------------------: | :-----------: | :---------------------------------------------------- | :---------------: | :-------------: | :-----------------------: | :-------------: |
|       `learn-nitro-starter-with-vercel`       |    单项目     | Nitro v3 入门学习项目（Neon + Drizzle + Vercel/CF）   |  `3.0.1-alpha.1`  | devDependencies |      `3.0.1-alpha.1`      |      alpha      |
|           `01s-11comm/package.json`           |  monorepo 根  | pnpm+turbo 智慧社区全栈（Vue3/vite + vuepress）       |  `3.0.1-alpha.2`  | devDependencies |      `3.0.1-alpha.2`      |      alpha      |
|             `01s-11comm/apps/api`             | monorepo 子包 | Nitro API 服务（drizzle-orm + Neon + S3）             |  `3.0.1-alpha.2`  |  dependencies   |      `3.0.1-alpha.2`      |      alpha      |
|               `01s-11comm-app`                |    单项目     | unibest uniapp 跨端模板（nitro 用于 H5 SSR/mock）     | `3.0.260311-beta` | devDependencies |     `3.0.260311-beta`     | beta（2026-03） |
|      `SmallAliceWeb/packages/ai-rag-api`      | monorepo 子包 | Nitro API 服务（AI SDK + Drizzle + postgres，Vercel） | `3.0.260610-beta` |  dependencies   |     `3.0.260610-beta`     | beta（2026-06） |
| `SmallAliceWeb-main-sync/packages/ai-rag-api` | monorepo 子包 | SmallAliceWeb 同步快照副本（无 lockfile）             | `3.0.260610-beta` |  dependencies   | 无 lockfile（按声明判定） | beta（2026-06） |
|     `monorepo/packages/skill-router-mcp`      | monorepo 子包 | MCP Skill Router（Cloudflare Workers + Nitro 构建）   | `3.0.260610-beta` |  dependencies   |     `3.0.260610-beta`     | beta（2026-06） |

补充说明：`SmallAliceWeb` 根与 `monorepo` 根 package.json 无直接 nitro/nitropack 声明；`SmallAliceWeb` 的 pnpm-lock.yaml 中 `nitropack@2.13.3`（Nitro v2）由 `nuxt@3.21.2` 传递引入，仅存在于 lockfile 的 packages 段、importers 段无声明，**非直接依赖**；`monorepo` 全库 lockfile 无任何 `nitropack` 条目。

## 4. 版本差距分析

### 4.1 版本线演进关系

```log
alpha 线（2025-10 ~ 2026-01）         beta 线（2026-04 起，日期式版本）
3.0.1-alpha.0 → 3.0.1-alpha.1 ─┐     3.0.260415-beta → 3.0.260429-beta
               → 3.0.1-alpha.2 ─┼──→  3.0.260522-beta → 3.0.260610-beta → …
                                └─→  3.0.260311-beta（unibest 所用，为 beta 线早期节点）
```

### 4.2 差距量化

|          对比维度           |   本项目（alpha.1）    | 01s-11comm 系（alpha.2） |   01s-11comm-app（260311-beta）   | SmallAliceWeb/monorepo（260610-beta） |
| :-------------------------: | :--------------------: | :----------------------: | :-------------------------------: | :-----------------------------------: |
|      相对本项目的差距       |          基准          |     +1 个 alpha 补丁     |     跨版本线（alpha → beta）      |      跨版本线 + 约 5~7 个月迭代       |
|    涉及的直接依赖项目数     |           1            |            2             |                 1                 |                   3                   |
| 与官方 OpenAPI 文档的匹配度 | 能力已内置（本地验证） |           同左           | 同左，beta 线对 route-meta 有修复 |            同左，版本最新             |

### 4.3 关键结论

1. **版本不统一是主要问题**：同一开发者名下存在 alpha.1 / alpha.2 / 260311-beta / 260610-beta 四种版本口径，跨两条版本线。若要在多项目间复用 Nitro 开发经验（如 defineRouteMeta 宏、openapi 配置），建议收敛到**同一 beta 线版本**。
2. **差距可控**：最旧（alpha.1）与最新（260610-beta）之间虽有约半年迭代差距，但全部属于 Nitro v3 主线，无 v2 → v3 的破坏性迁移问题；且本项目为学习项目，接口规模小，升级成本低。
3. **建议对齐目标版本**：`3.0.260610-beta`（当前全盘最新）或等待官方 stable v3.0（beta 线官方口径「stable for most workloads，稳定版在即」）。

## 5. 升级建议（针对各项目）

|                    项目                    | 建议                               | 说明                                                                                                |
| :----------------------------------------: | :--------------------------------- | :-------------------------------------------------------------------------------------------------- |
|     `learn-nitro-starter-with-vercel`      | 升级至 `3.0.260610-beta`（或最新） | 本项目接口少（5 个），升级后需回归 `/_openapi.json`（openapi 功能随 beta 线有多次 route-meta 修复） |
|        `01s-11comm` 根 + `apps/api`        | 升级至 beta 线                     | 二者同为 alpha.2，与 beta 线差异最小，可先行试点                                                    |
|              `01s-11comm-app`              | 升级至最新 beta                    | 已在 beta 线（260311-beta），落后 2 个 beta 节点                                                    |
| `SmallAliceWeb` / `main-sync` / `monorepo` | 已是全盘最新（260610-beta），保持  | 无需动作；`SmallAliceWeb-main-sync` 为无 lockfile 快照副本，建议确认同步机制                        |

升级通用注意事项：升级前执行 `pnpm prepare` 重新生成 `.nitro/types`；升级后回归全部接口 + `/_openapi.json` 输出完整性；Nitro v3 beta 线曾修复 route-meta 去重、routing-meta import 去重等问题（旧版本多 handler 路由可能出现 spec 异常），升级收益明确。

## 6. 附：扫描覆盖说明与局限

- 覆盖：`D:\code\ruan-cat` 顶层 22 个目录中的全部 122 个 package.json；命中 7 个 nitro/nitropack 相关文件；复核子代理独立重跑确认无遗漏。
- 局限：
  1. `SmallAliceWeb-main-sync` 无 lockfile，其 `260610-beta` 仅能按 package.json 声明判定（与 `SmallAliceWeb` 主副本一致，可信度高）；
  2. 未包含 `D:\code\ruan-cat` 之外的其他磁盘目录项目（如用户其他工作区）；
  3. 扫描基于当前工作区状态，不追踪历史版本变更。
