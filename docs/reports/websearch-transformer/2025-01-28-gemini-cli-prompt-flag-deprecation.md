# 2025-01-28 Gemini CLI `-p/--prompt` 标志弃用说明

## 1. 概述

Gemini CLI 已经弃用了 `-p` 或 `--prompt` 标志。现在应直接使用**位置参数**来传递提示内容。

## 2. 核心变更

|      项目      |          说明           |
| :------------: | :---------------------: |
|  **弃用内容**  | `-p` 和 `--prompt` 标志 |
|  **替代方案**  |    使用位置参数传递     |
| **完全移除于** |  v0.11.0 (2025-10-20)   |

## 3. 用法对比

### 3.1. 新用法（推荐）

直接在命令后跟随提示文本：

```bash
gemini "你的提示内容"
```

或带其他参数：

```bash
gemini --model gemini-2.5-flash --output-format text "你的提示内容"
```

### 3.2. 旧用法（已弃用）

```bash
gemini -p "你的提示内容"        # 已弃用
gemini --prompt "你的提示内容"  # 已弃用
```

## 4. 变更时间线

|  版本   |    日期    |                             变更内容                             |
| :-----: | :--------: | :--------------------------------------------------------------: |
| v0.4.0  | 2025-09-01 | 开始弃用冗余的 CLI 标志，建议用户迁移到 `settings.json` 进行配置 |
| v0.11.0 | 2025-10-20 |               正式移除 `--prompt` 及其他已弃用标志               |

## 5. 变更目的

1. **简化 CLI 接口** - 减少冗余参数
2. **强制非交互模式** - 统一使用位置参数输入提示
3. **配置迁移** - 鼓励使用 `settings.json` 进行持久化配置

## 6. 其他同时弃用的标志

以下标志也已被弃用，建议在 `settings.json` 中配置相应选项：

|         标志          |       替代方案       |
| :-------------------: | :------------------: |
|    `--telemetry-*`    |  settings.json 配置  |
|     `--all-files`     |  settings.json 配置  |
| `--show-memory-usage` |  settings.json 配置  |
|   `--sandbox-image`   |  settings.json 配置  |
|       `--proxy`       |  settings.json 配置  |
|   `--checkpointing`   |  settings.json 配置  |
|    `--interactive`    | 默认行为 / `-i` 标志 |

## 7. 迁移建议

### 7.1. 脚本更新

如果脚本中使用了 `-p` 标志：

```bash
# 旧写法
gemini -p "$PROMPT"

# 新写法
gemini "$PROMPT"

# 或通过 stdin 传递（仍然支持）
echo "$PROMPT" | gemini
```

### 7.2. Node.js spawnSync 调用

```javascript
// 旧写法
spawnSync("gemini", ["--model", model, "-p", prompt]);

// 新写法（位置参数）
spawnSync("gemini", ["--model", model, prompt]);

// 或通过 stdin 传递
spawnSync("gemini", ["--model", model], { input: prompt });
```

## 8. 参考资料

- Gemini CLI 官方帮助：`gemini --help`
- 配置文件位置：`~/.gemini/settings.json`
