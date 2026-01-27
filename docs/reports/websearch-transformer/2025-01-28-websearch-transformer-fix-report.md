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

5. **参数解析错误**

   ```log
   Not enough arguments following: prompt
   ```

## 3. 根本原因分析

| 序号 |            问题             |                         原因                          |
| :--: | :-------------------------: | :---------------------------------------------------: |
|  1   |     `-p` 标志与位置参数     |    Gemini CLI 更新后废弃了 `-p` 标志，改用位置参数    |
|  2   |  ImportProcessor 扫描错误   |    spawnSync 继承当前工作目录，Gemini CLI 扫描项目    |
|  3   | GEMINI_API_KEY 环境变量缺失 |  settings.json 配置为 API Key 模式，而非 OAuth 模式   |
|  4   |          执行超时           |           默认 55 秒超时对网络搜索任务不足            |
|  5   |        参数解析错误         | 多行 prompt 作为命令行参数在 Windows shell 中解析失败 |

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
	console.error(`[CCS Hook] Executing: echo "..." | gemini --model ${model} --output-format text`);
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
const spawnResult = spawnSync("gemini", ["--model", model, "--output-format", "text"], {
	encoding: "utf8",
	timeout: timeoutMs,
	maxBuffer: 1024 * 1024 * 2,
	stdio: ["pipe", "pipe", "pipe"],
	input: prompt,
	shell: process.platform === "win32",
	cwd: process.env.HOME || process.env.USERPROFILE || "/tmp",
});
```

**修改点汇总**:

|    项目     |           原版           |                           修改后                            |
| :---------: | :----------------------: | :---------------------------------------------------------: |
| 命令行参数  |    `--yolo -p prompt`    |                   `--output-format text`                    |
| prompt 传递 |      命令行位置参数      |                  通过 `input` 选项 (stdin)                  |
|    shell    |          （无）          |               `process.platform === "win32"`                |
|     cwd     | （无，继承当前工作目录） | `process.env.HOME \|\| process.env.USERPROFILE \|\| "/tmp"` |

**修改原因**:

1. **移除 `--yolo`**: 该参数会自动批准所有工具调用，在搜索场景下不必要
2. **移除 `-p`**: Gemini CLI 新版废弃了 `-p` 标志，改用位置参数
3. **添加 `--output-format text`**: 与 task-complete-notifier.sh 保持一致，使输出更简洁
4. **通过 stdin 传递 prompt**: 使用 `input` 选项而非命令行参数，避免多行文本在 Windows shell 中的解析问题
5. **添加 `shell: true`**: Windows 平台需要通过 shell 执行命令
6. **添加 `cwd`**: 避免 Gemini CLI 扫描当前项目目录的 CLAUDE.md 文件

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

## 6. 已知限制：UI 显示 "blocking error"

### 6.1. 问题描述

虽然 WebSearch 功能正常工作，但 Claude Code CLI 会显示 "blocking error" 提示：

```log
PreToolUse:WebSearch hook blocking error from command: "node ..."
```

### 6.2. 原因分析

这是 **Claude Code CLI 的设计限制**，而非真正的错误：

1. **Hook 机制限制**: 为了让 Claude 读取到搜索结果，必须使用 `permissionDecision: "deny"`
2. **UI 硬编码**: Claude Code CLI 将任何 `deny` 决策都显示为 "blocking error"
3. **无法绕过**: 即使使用 `exit(0)` 和正确的 JSON 格式，UI 仍会显示此提示

### 6.3. 功能状态

|      方面       |           状态           |
| :-------------: | :----------------------: |
|    搜索功能     |       ✅ 正常工作        |
| Claude 获取结果 |         ✅ 成功          |
|     UI 显示     | ⚠️ 显示 "blocking error" |

### 6.4. Claude Code Hook 输出规范

根据官方文档，`permissionDecision` 有以下选项：

|    值     | 工具是否执行 |       显示给 Claude        |    显示给用户    |
| :-------: | :----------: | :------------------------: | :--------------: |
| `"allow"` |      是      |  `additionalContext` 可选  |    无特殊提示    |
| `"deny"`  |      否      | `permissionDecisionReason` | "blocking error" |
|  `"ask"`  |   用户决定   |             无             |  弹出确认对话框  |

**结论**: 要让 Claude 读取自定义搜索结果，必须使用 `"deny"`，这必然导致 UI 显示 "blocking error"。

## 7. 经验教训

1. **Gemini CLI 版本兼容性**: 新版 Gemini CLI 废弃了 `-p/--prompt` 标志，需要使用位置参数或 stdin
2. **工作目录隔离**: 调用外部 CLI 工具时，应显式设置 `cwd` 避免扫描当前项目目录
3. **认证模式一致性**: 确保 settings.json 中的认证模式与实际认证方式匹配
4. **超时时间配置**: 网络请求任务需要更长的超时时间
5. **多行文本传递**: 在 Windows 平台上，多行文本应通过 stdin 传递而非命令行参数
6. **Hook 机制限制**: Claude Code 的 hook `deny` 决策会显示为 "blocking error"，这是设计限制而非 bug

## 8. 建议后续行动

1. 向 CCS 项目提交 Issue 或 PR，更新 websearch-transformer.cjs 以兼容新版 Gemini CLI
2. 考虑将超时时间改为可配置参数
3. 添加更详细的错误日志，便于问题排查
4. 向 Claude Code 团队提交 Feature Request，建议：
   - 添加 `permissionDecision: "replace"` 选项用于工具替换场景
   - 或修改 UI 显示逻辑，区分 "error" 和 "graceful denial"
