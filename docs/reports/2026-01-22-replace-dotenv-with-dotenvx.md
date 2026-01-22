# 2026-01-22 替换 dotenv 为 dotenvx 与环境变量管理复盘

## 1. 变更背景

为了响应社区发展趋势及官方建议，我们将项目中已废弃或功能较旧的 `dotenv` 依赖替换为官方推荐的最新包 `@dotenvx/dotenvx`。同时，针对开发过程中关于“如何确保本地与 Vercel 云端环境变量一致性”的疑问进行了梳理和解答。

## 2. 变更实施细节

### 2.1 依赖变更

执行了以下包管理操作：

1.  **移除旧依赖**：
    ```bash
    pnpm remove dotenv
    ```
2.  **添加新依赖**：
    ```bash
    pnpm add -D @dotenvx/dotenvx
    ```

### 2.2 代码调整

对项目中引用了 `dotenv` 的核心配置文件进行了更新，将导入路径从 `dotenv` 修改为 `@dotenvx/dotenvx`。

**涉及文件：**

1.  `drizzle.config.ts` (Drizzle Kit 配置文件)
2.  `server/db/seed.ts` (数据库种子数据脚本)

**修改示例：**

```typescript
// 修改前
import { config } from "dotenv";

// 修改后
import { config } from "@dotenvx/dotenvx";
```

## 3. 环境变量一致性机制解析

关于“如何确保获取的环境变量始终是最正确的变量”，我们梳理了本地开发环境与 Vercel 生产环境的协同机制。

### 3.1 核心机制对比

| 环境                    | 变量来源    | 运作方式                                                              | 最佳实践                                                                                         |
| :---------------------- | :---------- | :-------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **本地开发 (Local)**    | `.env` 文件 | 代码中的 `config()` 读取项目根目录的 `.env` 文件加载变量。            | 使用 `pnpm env:pull` (即 `vercel env pull`) 定期从 Vercel 拉取最新的环境变量到本地 `.env` 文件。 |
| **Vercel 云端 (Cloud)** | 平台注入    | Vercel 构建/运行时直接将 Dashboard 中配置的变量注入到 `process.env`。 | 在 Vercel Dashboard 的 Project Settings > Environment Variables 中统一管理变量。                 |

### 3.2 为什么 `@dotenvx/dotenvx` 能通用？

`@dotenvx/dotenvx` 的 `config()` 方法具有良好的兼容性：

1.  **在本地**：它会寻找并读取 `.env` 文件，将变量加载到 `process.env` 中。
2.  **在云端**：通常 `.env` 文件不会被上传（被 `.gitignore` 忽略）。当 `config()` 找不到 `.env` 文件时，它会静默失败或跳过，此时应用直接使用 Vercel 平台已经注入好的 `process.env` 变量。

### 3.3 结论

要确保环境变量的“正确性”和“一致性”，关键在于：

1.  **以 Vercel Dashboard 为单一事实来源 (Single Source of Truth)**。所有的环境变量变更首先在 Vercel 后台进行。
2.  **本地开发养成同步习惯**。在开始开发前或环境变量变更后，运行 `pnpm env:pull` 保持本地 `.env` 与云端同步。
