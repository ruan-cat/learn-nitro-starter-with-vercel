# 2026-08-25 nitro 版本确认与升级计划：monorepo/packages/skill-router-mcp

> **元信息**：本报告由 WorkBuddy（AI agent 工具）调研生成。AI 模型：探索子代理（低配）+ 编辑子代理（低配）。报告日期：2026-08-25。素材来源：探索子代理 E1（npm dist-tag / 版本线核实）、E2（本项目 package 现状核实），素材已核实，本文档为版本确认 + 潜在风险 + 保持计划，**不涉及任何升级动作**。

---

## 1. 结论摘要（TL;DR）

|       项目       |     monorepo/packages/skill-router-mcp      |
| :--------------: | :-----------------------------------------: |
| 当前 nitro 版本  |      `3.0.260610-beta`（dependencies）      |
|     目标版本     | `3.0.260610-beta`（npm latest，2026-06-10） |
|     是否一致     |                 ✅ 完全一致                 |
|   **升级动作**   |           **无需升级（无动作）**            |
| 参与本次批量升级 |                  ❌ 不涉及                  |

- 本项目当前锁定依赖即为 npm `dist-tag: latest` 指向的终点版本 `3.0.260610-beta`，与升级目标完全一致，**不存在版本差距**。
- npm 存在 `3.0.0` stable 占位发布（2025-10-10），但无任何 `dist-tag` 指向它，不建议使用。
- beta 线完整序列为 `260311 → 260415 → 260429 → 260522 → 260603 → 260610`，其中 **`260610` 是当前序列终点**（已核实无更新版本）。
- 保持计划 = 无动作。本项目拥有 CI 强护栏（push dev 必跑 `typecheck + test:all + build`），任何未来升级破坏都会被 CI 立即捕获。
- 仅在**未来**决定升级到其他 beta 版本时，才需要重新评估第 4、5 节所列破坏点与联动项。

---

## 2. 项目现状

### 2.1 项目定位

- 仓库位置：`monorepo/packages/skill-router-mcp`（monorepo workspace 包）。
- 定位：基于 Nitro + Cloudflare Workers 的 MCP（Model Context Protocol）路由服务，将 HTTP 请求桥接给 MCP SDK。

### 2.2 依赖清单（相关核心依赖）

|           依赖            |            版本            |
| :-----------------------: | :------------------------: |
|           nitro           |     `3.0.260610-beta`      |
| @modelcontextprotocol/sdk |          `1.30.0`          |
|            zod            |          `4.4.3`           |
|         wrangler          | `4.122.0`（部署/开发工具） |

### 2.3 nitro 配置要点

- `defineNitroConfig`：使用 Nitro 提供的类型化配置入口。
- `preset: "cloudflare_module"`：已使用 Cloudflare Module Worker preset（即新命名，非旧 `cloudflare`）。
- `compatibilityDate: 2024-09-19`
- `serverDir: "./server"`
- `apiBaseURL: "/"`

### 2.4 handler 与请求处理链路

- 路由：`server/api/` 下共 **2 个路由**：
  - `health.get`：健康检查。
  - `mcp.post`：MCP 请求入口。
- 写法：`defineEventHandler`，**直接透传 `event.req`（Web Standard `Request`）**给 MCP SDK 的 `WebStandardStreamableHTTPServerTransport`。
- 核心链路：`HTTP 请求 → event.req（标准 Request）→ WebStandardStreamableHTTPServerTransport → MCP SDK 处理`。

### 2.5 部署方式

- 平台：**Cloudflare Workers**。
- 配置：`wrangler.toml`，含 `nodejs_compat`（Node 兼容）、`CF_VERSION_METADATA`、`observability` 等配置。

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
- 核心链路（`event.req → Web Standard Request → MCP SDK Transport`）已在 `3.0.260610-beta` 下实际运行验证，属该版本下验证过的组合。

---

## 4. 潜在风险点

|         风险点          |                                                                           说明                                                                           | 风险等级 |                                     应对                                      |
| :---------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------: | :------: | :---------------------------------------------------------------------------: |
| 1. 核心链路依赖版本行为 |         核心链路（`event.req` → 标准 `Request`）已在 `260610` 验证通过；若未来升到其他 beta，`event.req` 语义或 h3 版本行为变化可能影响 MCP 透传         |  🟢 低   | 保持当前版本不动；未来升级时回归 `health.get` + `mcp.post` 两个路由的透传行为 |
|     2. CI 即时拦截      | 16 个测试 + CI（`ci.yaml` → `skill-router-mcp.yml` `workflow_call`，push dev 必跑 `typecheck + test:all + build`）。升级引入的任何破坏都会被 CI 立即捕获 |  🟢 低   |           CI 已是最强护栏，无需额外动作；保持 workflow 配置不变即可           |

> 风险等级说明：🔴 高 = 需立即处理；🟡 中 = 需关注/计划处理；🟢 低 = 接受现状或长期关注。本项目两项风险均为 🟢 低，且全部不因「保持当前版本」而触发。

---

## 5. 保持计划 / 未来升级注意事项

### 5.1 当前保持计划（本次批量升级）

- **无任何升级动作**。不修改 `package.json`、不重装依赖、不改 nitro 配置与 `wrangler.toml`。
- 本项目明确**不涉及**本次批量升级（`up-to-latest-nitro`）。
- 保持期间日常 CI（`typecheck + test:all + build`）照常作为质量护栏。

### 5.2 未来若升级到其他 beta 的注意事项

以下破坏点在从 `260610` 升级到**其他** beta 时需重新评估（来自 E1 通用核实）：

1. **移除 `moduleSideEffects` config**：若未来版本移除该配置项，需同步从 nitro 配置中删除。（本项目未使用该配置，仅作未来升级预警）
2. **preset 重命名（`cloudflare` → `cloudflare_module`）**：✅ **本项目已使用 `cloudflare_module` 新命名**，该破坏点对当前项目不构成升级阻碍；但需确认未来版本是否对 preset 配置另有改动。
3. **cloudflare env bindings 写法变化**：若未来涉及 env bindings 访问，需改为 `event.req.runtime.cloudflare.env` 形式。
4. **依赖大换血**：h3 将升级到 `2.0.1-rc.22` 等，`event.req` 作为标准 `Request` 透传给 MCP SDK 的语义需重点回归。

### 5.3 未来升级时的联动动作（针对本项目）

- 重点回归：`mcp.post` 的 `event.req → WebStandardStreamableHTTPServerTransport` 透传链路，以及 `health.get` 健康检查。
- 依赖 CI：`skill-router-mcp.yml` `workflow_call`（push dev 必跑 `typecheck + test:all + build`）会在升级提交时自动兜底，升级破坏将第一时间暴露。
- 若 h3 大版本行为变化导致透传失败，优先核对 `WebStandardStreamableHTTPServerTransport` 对标准 `Request` 的兼容说明。

---

## 6. 验证方式

以下命令可用于确认「无需升级」结论（在包目录 `packages/skill-router-mcp` 下执行）：

```bash
# 确认当前锁定版本
node -p "require('./package.json').dependencies.nitro"

# 确认 npm latest 与本地一致（预期输出 3.0.260610-beta）
npm view nitro dist-tags.latest

# 跑既有测试与构建，确认保持当前版本下全绿
pnpm test:all
pnpm build
```

- 预期结果：本地 `dependencies.nitro === 3.0.260610-beta`，与 `npm view nitro dist-tags.latest` 输出一致；`test:all` 与 `build` 通过。
- 当前状态下不需要执行任何升级、安装或配置变更命令。

---

## 7. 参考

|    来源     |                                                                           说明                                                                            |
| :---------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------: |
| E1 探索核实 |       npm `dist-tag: latest` → `3.0.260610-beta`；`3.0.0` stable 占位发布（2025-10-10）无 dist-tag；beta 序列终点为 `260610`；未来 beta 破坏点清单        |
| E2 探索核实 | 本项目 package.json、nitro 配置（`cloudflare_module` preset）、handler 透传链路、`wrangler.toml` 部署配置、16 个测试与 `skill-router-mcp.yml` CI workflow |
|  用户需求   |                                     统一对齐到 `3.0.260610-beta` 的批量升级计划，本项目为「版本确认 + 保持计划」类型                                      |

---

_本报告为版本确认类文档，不包含任何代码或配置变更。_
