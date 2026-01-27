# 2025-01-28 WebSearch Transformer 修复事故报告

## 1. 事故概述

在使用 Claude Code 的 WebSearch 工具时，Gemini CLI 作为搜索提供商无法正常工作，导致 WebSearch 功能失效。

## 2. 错误现象

依次出现以下错误：

1. **参数冲突错误**

   ```log
   Cannot use both a positional prompt and the --prompt (-p) flag together
   ```

2. **项目文件扫描错误**

   ```log
   [ERROR] [ImportProcessor] Failed to import ruan-cat/commitlint-config: ENOENT
   [ERROR] [ImportProcessor] Failed to import changesets/cli: ENOENT
   ```

3. **认证模式错误**

   ```log
   When using Gemini API, you must specify the GEMINI_API_KEY environment variable.
   ```

4. **超时错误**
   ```log
   spawnSync C:\Windows\system32\cmd.exe ETIMEDOUT
   ```

## 3. 根本原因分析

| 序号 |            问题             |                        原因                        |
| :--: | :-------------------------: | :------------------------------------------------: |
|  1   |     `-p` 标志与位置参数     |  Gemini CLI 更新后废弃了 `-p` 标志，改用位置参数   |
|  2   |  ImportProcessor 扫描错误   |  spawnSync 继承当前工作目录，Gemini CLI 扫描项目   |
|  3   | GEMINI_API_KEY 环境变量缺失 | settings.json 配置为 API Key 模式，而非 OAuth 模式 |
|  4   |          执行超时           |          默认 55 秒超时对网络搜索任务不足          |

## 4. 文件修改对比

### 4.1. websearch-transformer.cjs 修改

**文件路径**: `C:\Users\pc\.ccs\hooks\websearch-transformer.cjs`

**原版来源**: https://github.com/kaitranntt/ccs/blob/main/lib/hooks/websearch-transformer.cjs

#### 4.1.1. 超时时间修改（第 115 行）

**原版**:

```javascript
const DEFAULT_TIMEOUT_SEC = 55;
```

**修改后**:

```javascript
const DEFAULT_TIMEOUT_SEC = 120;
```

**修改原因**: 55 秒超时不足以完成 Gemini CLI 的网络搜索任务。

---

#### 4.1.2. 调试日志修改（第 295-298 行）

**原版**:

```javascript
if (process.env.CCS_DEBUG) {
	console.error(`[CCS Hook] Executing: gemini --model ${model} --yolo -p "..."`);
}
```

**修改后**:

```javascript
if (process.env.CCS_DEBUG) {
	console.error(`[CCS Hook] Executing: gemini --model ${model} --output-format text "..."`);
}
```

**修改原因**: 反映实际执行的命令参数。

---

#### 4.1.3. spawnSync 参数修改（第 301-312 行）

**原版**:

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--yolo", "-p", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
});
```

**修改后**:

```javascript
const spawnResult = spawnSync("gemini", ["--model", model, "--output-format", "text", prompt], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
	shell: process.platform === "win32",
	cwd: process.env.HOME || process.env.USERPROFILE || "/tmp",
});
```

**修改点汇总**:

|    项目    |           原版           |                           修改后                            |
| :--------: | :----------------------: | :---------------------------------------------------------: |
| 命令行参数 |    `--yolo -p prompt`    |                `--output-format text prompt`                |
|   shell    |          （无）          |               `process.platform === "win32"`                |
|    cwd     | （无，继承当前工作目录） | `process.env.HOME \|\| process.env.USERPROFILE \|\| "/tmp"` |

**修改原因**:

1. **移除 `--yolo`**: 该参数会自动批准所有工具调用，在搜索场景下不必要
2. **移除 `-p`**: Gemini CLI 新版废弃了 `-p` 标志，改用位置参数
3. **添加 `--output-format text`**: 与 task-complete-notifier.sh 保持一致，使输出更简洁
4. **添加 `shell: true`**: Windows 平台需要通过 shell 执行命令
5. **添加 `cwd`**: 避免 Gemini CLI 扫描当前项目目录的 CLAUDE.md 文件

---

### 4.2. Gemini CLI 配置修改

**文件路径**: `C:\Users\pc\.gemini\settings.json`

**原值**:

```json
"security": {
  "auth": {
    "selectedType": "gemini-api-key"
  }
}
```

**修改后**:

```json
"security": {
  "auth": {
    "selectedType": "oauth-personal"
  }
}
```

**修改原因**: 用户已完成 OAuth 认证（`oauth_creds.json` 存在），但配置文件错误地指定使用 API Key 模式。

## 5. 修复验证

修复后，WebSearch 功能恢复正常：

```log
[WebSearch Result via Gemini CLI]

Query: "Nitro v3 breaking changes"

Nitro v3 确实引入了一些重要的破坏性变更...
```

## 6. 经验教训

1. **Gemini CLI 版本兼容性**: 新版 Gemini CLI 废弃了 `-p/--prompt` 标志，需要使用位置参数
2. **工作目录隔离**: 调用外部 CLI 工具时，应显式设置 `cwd` 避免扫描当前项目目录
3. **认证模式一致性**: 确保 settings.json 中的认证模式与实际认证方式匹配
4. **超时时间配置**: 网络请求任务需要更长的超时时间

## 7. 建议后续行动

1. 向 CCS 项目提交 Issue 或 PR，更新 websearch-transformer.cjs 以兼容新版 Gemini CLI
2. 考虑将超时时间改为可配置参数
3. 添加更详细的错误日志，便于问题排查
