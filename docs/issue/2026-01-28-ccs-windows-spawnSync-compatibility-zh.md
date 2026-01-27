# 2026-01-28 CCS Windows 兼容性问题：spawnSync 无法执行 pnpm 安装的 CLI 工具

## 问题概述

在 Windows 系统上，使用 pnpm 全局安装的 `@google/gemini-cli`，在终端中可以正常使用，但在 CCS 的 `lib/hooks/websearch-transformer.cjs` 中通过 `spawnSync` 调用时失败，报错 `ENOENT`（文件未找到）。

## 环境信息

|    项目    |         版本/信息         |
| :--------: | :-----------------------: |
|  操作系统  |  Windows 10 (10.0.19045)  |
|  Node.js   |           20.x            |
|  包管理器  |           pnpm            |
|  CCS 版本  |          最新版           |
| Gemini CLI | @google/gemini-cli@0.25.2 |

## 问题复现步骤

1. 使用 pnpm 全局安装 Gemini CLI：

   ```bash
   pnpm add -g @google/gemini-cli
   ```

2. 验证安装成功（在终端中可以正常找到）：

   ```bash
   where gemini
   # 输出: C:\Users\pc\AppData\Local\pnpm\gemini
   #       C:\Users\pc\AppData\Local\pnpm\gemini.CMD
   ```

3. 使用 CCS 的第三方配置（如 Antigravity）启动 Claude Code

4. 触发 WebSearch 工具调用

5. 收到错误信息：

   ```plain
   [WebSearch - All Providers Failed]

   Tried all enabled CLI tools but all failed:
     - Gemini CLI: Gemini CLI not installed

   Query: "..."

   Troubleshooting:
     - Gemini: run `gemini` to authenticate (opens browser)
   ```

## 根本原因分析

### 1. pnpm 在 Windows 上的安装方式

pnpm 在 Windows 上全局安装包时，会创建以下文件：

- `C:\Users\pc\AppData\Local\pnpm\gemini` - 无扩展名的 shim 文件
- `C:\Users\pc\AppData\Local\pnpm\gemini.CMD` - Windows 批处理文件

### 2. `isCliAvailable` 函数正常工作

在 `websearch-transformer.cjs` 的第 155-169 行，`isCliAvailable` 函数使用 `where.exe` 检查命令是否存在：

```javascript
function isCliAvailable(cmd) {
	try {
		const isWindows = process.platform === "win32";
		const whichCmd = isWindows ? "where.exe" : "which";

		const result = spawnSync(whichCmd, [cmd], {
			encoding: "utf8",
			timeout: 2000,
			stdio: ["pipe", "pipe", "pipe"],
		});
		return result.status === 0 && result.stdout.trim().length > 0;
	} catch {
		return false;
	}
}
```

这个函数可以正确找到 `gemini.CMD`，返回 `true`。

### 3. `tryGeminiSearch` 函数执行失败

在第 287-296 行，实际执行 gemini 命令时：

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--yolo", "-p", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
});
```

**问题所在**：Node.js 的 `spawnSync` 在没有 `shell: true` 选项时，不会自动解析 Windows 的 `PATHEXT` 环境变量，因此无法找到 `.CMD` 或 `.BAT` 文件。

### 4. 验证测试

使用 Node.js 直接测试：

```javascript
const { spawnSync } = require("child_process");

// 无 shell 选项 - 失败
const r1 = spawnSync("gemini", ["--version"], { encoding: "utf8" });
console.log(r1.error);
// Error: spawnSync gemini ENOENT

// 有 shell 选项 - 成功（但可能因未认证而超时）
const r2 = spawnSync("gemini", ["--version"], { encoding: "utf8", shell: true });
// 可以正确启动进程
```

## 建议修复方案

在所有 `spawnSync` 调用中添加 `shell: true` 选项（仅限 Windows）：

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--yolo", "-p", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
	shell: process.platform === "win32", // 添加此行
});
```

需要修改的位置：

|       函数名        | 行号（大约） |
| :-----------------: | :----------: |
|  `tryGeminiSearch`  |   287-296    |
| `tryOpenCodeSearch` |   353-362    |
|   `tryGrokSearch`   |   415-420    |

## 相关文档

- [Node.js child_process.spawnSync 文档](https://nodejs.org/api/child_process.html#child_processspawnsynccommand-args-options)
- [Windows PATHEXT 环境变量说明](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/path)

## 总结

这是一个 Windows 平台特有的兼容性问题。`isCliAvailable` 使用系统命令 `where.exe` 可以正确找到 `.CMD` 文件，但 `spawnSync` 直接执行时不会自动解析 `PATHEXT`，导致找不到命令。添加 `shell: true` 选项可以解决此问题。
