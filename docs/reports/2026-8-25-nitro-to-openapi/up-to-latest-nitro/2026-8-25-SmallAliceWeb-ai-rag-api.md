# 2026-08-25 nitro 版本确认与升级计划：SmallAliceWeb/packages/ai-rag-api

> **元信息**：本报告由 WorkBuddy（AI agent 工具）调研生成。AI 模型：探索子代理（低配）+ 编辑子代理（低配）。报告日期：2026-08-25。素材来源：探索子代理 E1（npm dist-tag / 版本线核实）、E2（本项目 package 现状核实），素材已核实，本文档为版本确认 + 潜在风险 + 保持计划，**不涉及任何升级动作**。

---

## 1. 结论摘要（TL;DR）

|       项目       |      SmallAliceWeb/packages/ai-rag-api      |
| :--------------: | :-----------------------------------------: |
| 当前 nitro 版本  |      `3.0.260610-beta`（dependencies）      |
|     目标版本     | `3.0.260610-beta`（npm latest，2026-06-10） |
|     是否一致     |                 ✅ 完全一致                 |
|   **升级动作**   |           **无需升级（无动作）**            |
| 参与本次批量升级 |                  ❌ 不涉及                  |

- 本项目当前锁定依赖即为 npm `dist-tag: latest` 指向的终点版本 `3.0.260610-beta`，与升级目标完全一致，**不存在版本差距**。
- npm 存在 `3.0.0` stable 占位发布（2025-10-10），但无任何 `dist-tag` 指向它，不建议使用。
- beta 线完整序列为 `260311 → 260415 → 260429 → 260522 → 260603 → 260610`，其中 **`260610` 是当前序列终点**（已核实无更新版本）。
- 保持计划 = 无动作。仅在**未来**决定升级到其他 beta 版本时，才需要重新评估第 4、5 节所列破坏点与联动项。

---

## 2. 项目现状

### 2.1 项目定位

- 仓库位置：`SmallAliceWeb/packages/ai-rag-api`（workspace 包）。
- 定位：面向 AI RAG 场景的 Nitro API 服务包，业务逻辑与 HTTP handler 分离。
- 覆盖说明：`SmallAliceWeb-main-sync` 是 `SmallAliceWeb` 的同步快照副本（内容一致、无独立 lockfile），本报告结论一并适用。

### 2.2 依赖清单（相关核心依赖）

|      依赖      |                    版本                    |
| :------------: | :----------------------------------------: |
|     nitro      |             `3.0.260610-beta`              |
| @ai-sdk/openai |                 `^1.3.22`                  |
|       ai       |                 `^4.3.16`                  |
|  drizzle-orm   |                 `^0.44.7`                  |
|    postgres    | `^1.x`（未指定 patch，随 postgres 主版本） |
|      zod       |                 `^3.25.76`                 |
|  ai-rag-core   |              workspace 内部包              |

### 2.3 nitro 配置要点

- `compatibilityDate: 2024-09-19`
- `serverDir: "server"`
- `runtimeConfig`：十余个配置 key（业务环境变量透传）
- `rolldownConfig.output.inlineDynamicImports`：开启动态导入内联
- `routeRules`：`"/v1/**"` 配置 CORS

### 2.4 handler 与业务逻辑结构

- 路由：`server/routes/v1/` 下共 **5 个路由**。
- 写法：`defineEventHandler` + `readBody` + `setResponseStatus`（均来自 `nitro` / `h3`）。
- 事件对象：使用 `event.req.signal`（Web Standard `Request` 风格）。
- 业务逻辑：抽离到 `server/contracts/` 纯函数，统一返回 `{ status, body }`，HTTP 层只负责装配响应。

### 2.5 部署方式

- 平台：**Vercel**。
- 构建链路：`build:vercel` 脚本构建后经 `move-vercel-output-to-root` 把产物移动到仓库根目录，满足 Vercel 部署要求。

---

## 3. 版本确认（已是目标版本）

### 3.1 版本比对

|                 维度                  |                 数值                  |     结论      |
| :-----------------------------------: | :-----------------------------------: | :-----------: |
| 当前版本（package.json dependencies） |           `3.0.260610-beta`           |       —       |
|        npm `dist-tag: latest`         |           `3.0.260610-beta`           |    ✅ 一致    |
|         是否有更新的 npm 版本         |             无（已核实）              |   ✅ 无差距   |
|        `3.0.0` stable 占位发布        | 2025-10-10 发布，**无 dist-tag 指向** | ⚠️ 不建议使用 |

### 3.2 结论

- 本项目当前运行/锁定的版本即为升级目标终点版本，**版本确认通过，无需升级**。
- 运行态即目标态：本项目已在 `3.0.260610-beta` 下运行验证，`runtimeConfig` / `routeRules` / `compatibilityDate` 均为该版本下验证过的配置组合，无升级引入的配置漂移。

---

## 4. 潜在风险点

|                   风险点                    |                                                                    说明                                                                    | 风险等级 |                                             应对                                             |
| :-----------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------: | :------: | :------------------------------------------------------------------------------------------: |
| 1. `package-boundary.test.ts:57` 版本硬断言 |                   测试断言 `nitro === "3.0.260610-beta"`。保持目标版本即绿；若未来升到其他 beta，断言会变红，需同步修改                    |  🟢 低   |                    保持当前版本不动即可；未来升级时同步更新断言中的版本号                    |
|          2. 本包 build 无 CI 兜底           |       20+ 个 vitest 测试（含 `routes/chat-http` 等），但 SmallAliceWeb 的 `ci.yaml` 只覆盖 `ai-vue-doc`，本包 build 不在 CI 覆盖范围       |  🟢 低   | 当前无升级动作不触发风险；建议后续为 `ai-rag-api` 补充 CI 的 build + test 覆盖，作为长期护栏 |
|             3. 运行态即目标版本             | 已是目标版本运行态，`runtimeConfig` / `routeRules` / handler 写法（`event.req` Web Standard 风格）均为 `260610` 下验证过的组合，无升级风险 |  🟢 低   |                                     无动作；保持现状即可                                     |

> 风险等级说明：🔴 高 = 需立即处理；🟡 中 = 需关注/计划处理；🟢 低 = 接受现状或长期关注。本项目三项风险均为 🟢 低，且全部不因「保持当前版本」而触发。

---

## 5. 保持计划 / 未来升级注意事项

### 5.1 当前保持计划（本次批量升级）

- **无任何升级动作**。不修改 `package.json`、不重装依赖、不改 nitro 配置。
- 本项目明确**不涉及**本次批量升级（`up-to-latest-nitro`）。
- 保持期间日常操作照旧：`build:vercel` 部署链路不变。

### 5.2 未来若升级到其他 beta 的注意事项

以下破坏点在从 `260610` 升级到**其他** beta 时需重新评估（来自 E1 通用核实）：

1. **移除 `moduleSideEffects` config**：若未来版本移除该配置项，需同步从 nitro 配置中删除，否则可能报未知配置告警。（本项目未使用该配置，仅作未来升级预警）
2. **preset 重命名（`cloudflare` → `cloudflare_module`）**：若涉及 Cloudflare 部署需关注 preset 命名变更；本项目当前走 Vercel，不直接受影响，但需保持对上游变动的感知。
3. **cloudflare env bindings 写法变化**：若未来涉及 Cloudflare 部署，env bindings 需改为 `event.req.runtime.cloudflare.env` 形式。
4. **依赖大换血**：h3 将升级到 `2.0.1-rc.22` 等，涉及 `readBody` / `setResponseStatus` / `event.req` 等 API 行为可能变化，需回归 5 个路由。

### 5.3 未来升级时的联动动作（针对本项目）

- 同步修改 `package-boundary.test.ts:57` 的 nitro 版本硬断言。
- 建议补齐 `ai-rag-api` 的 CI 覆盖（build + 20+ vitest 测试），避免升级回归无人兜底。
- 回归验证项：5 个 `/v1/**` 路由 + `routeRules` CORS + `runtimeConfig` 透传 + `inlineDynamicImports` 产物。

---

## 6. 验证方式

以下命令可用于确认「无需升级」结论（在包目录 `packages/ai-rag-api` 下执行）：

```bash
# 确认当前锁定版本
node -p "require('./package.json').dependencies.nitro"

# 确认 npm latest 与本地一致（预期输出 3.0.260610-beta）
npm view nitro dist-tags.latest

# 跑既有测试，确认保持当前版本下全绿
pnpm test
```

- 预期结果：本地 `dependencies.nitro === 3.0.260610-beta`，与 `npm view nitro dist-tags.latest` 输出一致。
- 当前状态下不需要执行任何升级、安装或配置变更命令。

---

## 7. 参考

|    来源     |                                                                     说明                                                                     |
| :---------: | :------------------------------------------------------------------------------------------------------------------------------------------: |
| E1 探索核实 | npm `dist-tag: latest` → `3.0.260610-beta`；`3.0.0` stable 占位发布（2025-10-10）无 dist-tag；beta 序列终点为 `260610`；未来 beta 破坏点清单 |
| E2 探索核实 |          本项目 package.json、nitro 配置、handler/contracts 结构、部署链路、`package-boundary.test.ts:57` 断言、测试与 CI 覆盖情况           |
|  用户需求   |                               统一对齐到 `3.0.260610-beta` 的批量升级计划，本项目为「版本确认 + 保持计划」类型                               |

---

_本报告为版本确认类文档，不包含任何代码或配置变更。_
