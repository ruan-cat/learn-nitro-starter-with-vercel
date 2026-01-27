<!-- OPENSPEC:START -->

# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:

- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:

- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供在此仓库中工作的指导。

## 1. 主动问询实施细节

在我与你沟通并要求你具体实施更改时，难免会遇到很多模糊不清的事情。

请你**深度思考**这些`遗漏点`，`缺漏点`，和`冲突相悖点`，**并主动的向我问询这些你不清楚的实施细节**。请主动使用 claude code 内置的 `AskUserQuestion` 工具，将你不清楚的内容设计成一些列问题，并询问我，向我索要细节，或着与我协作沟通。

我会与你共同补充细化实现细节。我们会先迭代出一轮完整完善的实施清单，然后再由你亲自落实实施下去。

## 2. 编写测试用例规范

1. 请你使用 vitest 的 `import { test, describe } from "vitest";` 来编写。我希望测试用例格式为 describe 和 test。
2. 测试用例的文件格式为 `*.test.ts` 。
3. 测试用例的目录一般情况下为 `**/tests/` ，`**/src/tests/` 格式。
4. 在对应 monorepo 的 tests 目录内，编写测试用例。如果你无法独立识别清楚到底在那个具体的 monorepo 子包内编写测试用例，请直接咨询我应该在那个目录下编写测试用例。

## 3. 报告编写规范

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

## 4. 生成发版日志的操作规范

在你生成发版日志时，按照以下规范来完成：

1. 新建文件： 运行命令 `pnpm dlx @changesets/cli add --empty` ，该命令会在 `.changeset` 目录下，新建一个空的 markdown 文件，这个文件就是你要写入的发版日志。
2. 发版日志文件重命名： 这个命令会新建一个随机名称的发版日志文件，请你按照报告的规格，换成日期加语义化更新内容的名称。比如 `2025-12-15-add-pnpm-workspace-yaml.md` 就是有意义的命名。
3. yaml 区域写入 changeset 规格的发版信息： 写入发版包名，和`发版标签`的等级。
4. 写入更新日志： 在正文内编写更新日志。
5. 编写更新日志正文的行文规范：
   - 禁止使用任何等级的 markdown 标题： 编写任何`发版标签`的更新日志时，不允许使用任何等级的 markdown 标题，比如一级标题、二级标题等。这会影响自动合并的 `CHANGELOG.md` 文档的美观度。必须使用 markdown 的序号语法。
   - major： 详细，清晰。说明清楚 major 版本的重大变更。
   - minor： 用有序序号，简明扼要的说明清楚更新日志即可。
   - patch： 用有序序号，简明扼要的说明清楚更新日志即可。

## 5. 术语说明

在我和你沟通时，我会使用以下术语，便于你理解。

### 发版日志相关术语

- `生成更新日志` ： 指的是在 `.changeset` 目录内，编写面向 changeset 的更新日志文件。其`发版标签`分为 `major` `minor` `patch` 这三个档次。如果我在要求你生成更新日志时，没有说明清楚`发版标签`具体发版到那个等级，请及时询问我。要求我给你说明清楚。
- `生成发版日志` ： `生成更新日志` 的别名，是同一个意思。

## 6. 沟通协作要求

### `计划模式`

在`计划模式`下，请你按照以下方式与我协作：

1. 你不需要考虑任何向后兼容的设计，允许你做出破坏性的写法。请先设计一个合适的方案，和我沟通后再修改实施。
2. 如果有疑惑，请询问我。
3. 完成任务后，请告知我你做了那些破坏性变更。

请注意，在绝大多数情况下，我不会要求你以这种 `计划模式` 来和我协作。

## 7. 获取技术栈对应的上下文

在处理特定技术栈相关的问题时，你应该主动获取对应的上下文文档和最佳实践。

### claude code skill

- 编写语法与格式： https://code.claude.com/docs/zh-CN/skills
- 最佳实践： https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices
- 规范文档： https://agentskills.io/home

## 8. 代码/编码格式要求

### 2.1. markdown 文档的 table 编写格式

每当你在 markdown 文档内编写表格时，表格的格式一定是**居中对齐**的，必须满足**居中对齐**的格式要求。

### 2.2. markdown 文档的 vue 组件代码片段编写格式

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

### 2.3. javascript / typescript 的代码注释写法

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

### 2.4. unocss 配置不应该创建过多的 shortcuts 样式类快捷方式

在你做样式迁移的时候，**不允许滥用** unocss 的 shortcuts 功能。不要把那么多样式类都设计成公共全局级别的快捷方式。

### 2.5. vue 组件编写规则

1. vue 组件命名风格，使用短横杠的命名风格，而不是大驼峰命名。
2. 先 `<script setup lang="ts">`、然后 `<template>`、最后是 `<style scoped>` 。
3. 每个 vue 组件的最前面，提供少量的 html 注释，说明本组件是做什么的。

### 2.6. jsdoc 注释的 `@example` 标签不要写冗长复杂的例子

1. 你应该积极主动的函数编写 jsdoc 注释的 `@example` 标签。
2. 但是 `@example` 标签不允许写复杂的例子，请写简单的单行例子。完整的函数使用例子，你应该择机在函数文件的附近编写 md 文档，在文档内给出使用例子。

### 2.7. 页面 vue 组件必须提供注释说明本组件的`业务名`和`访问地址`

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

### 2.8. markdown 的多级标题要主动提供序号

对于每一份 markdown 文件的二级标题、三级标题和四级标题，你都应该要：

1. 主动添加**数字**序号，便于我阅读文档。
2. 主动**维护正确的数字序号顺序**。如果你处理的 markdown 文档，其手动添加的序号顺序不对，请你及时的更新序号顺序。

## 9. <!-- https://github.com/GuDaStudio/geminimcp --> Core Instruction for Gemini MCP

在任何时刻，你必须思考当前过程可以如何与 gemini 进行协作，如何调用 gemini 为你提供的 MCP 工具作为你**客观全面分析**的保障。

其中你**务必执行**以下几个步骤：

**1** 在你对用户需求**形成初步分析后**，
（1）首先将用户**原始需求（一字不差，严禁转述）**、以及你的初始思路告知 gemini；
（2）与 gemini 进行**充分讨论、辩驳**，以完善需求分析和实施计划。这一步的结束标志为，**必须**确保对用户需求的透彻理解，并**生成切实可行的行动计划**。

**2** 在实施具体编码任务前，你**必须向 gemini 索要代码实现原型**（要求 gemini 仅给出 unified diff patch，严禁对代码做任何真实修改）。在获取代码原型后，你**只能以此为逻辑参考，再次对代码修改进行重写**，形成企业生产级别、可读性极高、可维护性极高的代码后，才能实施具体编程修改任务。

- **注意：** Gemini 十分擅长前端代码，并精通样式、UI 组件设计。在涉及前端代码时，你必须向其索要代码原型（CSS/React/Vue/HTML 等前端代码），任何时刻，你**必须以 gemini 的前端设计（原型代码）为最终的前端代码基点**。
- 例如，当你识别到用户给出了前端设计需求，你的首要行为必须自动调整为，将用户需求原封不动转发给 gemini，并让其出具代码示例（此阶段严禁对用户需求进行任何改动、简写等等）。即你必须从 gemini 获取代码基点，才可以进行接下来的各种行为。

## 10. <!-- https://github.com/GuDaStudio/geminimcp --> Gemini Tool Invocation Specification

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

## 11. 使用 `gemini MCP` 或直接使用 `gemini` 时需要额外主动获取上下文

1. 在使用 `gemini MCP` 或直接使用 `gemini` 时，由于传递信息的关系，gemini 是不会主动的先阅读来自 claude code 的配置文件的，因此你必须要告诉 gemini，并约束 gemini 的上下文读取行为，**必须要求**gemini 首先要无条件的阅读 claude code 的上下文。
2. 请务必先主动阅读 `CLAUDE.md` 和 `.claude` 目录内的全部的指导文件。
3. 不需要你阅读以下文件：
   - .claude\settings.json
   - .claude\statusline.sh
4. 你的修改必须按照这些 claude code 文档的要求和约束来做。特别是 `agents` 和 `skills` 的要求。

## 12. 其他注意事项

1. 报告输出地址： 你在生成 markdown 格式的报告时，请默认输出到 `docs\reports` 目录下面，这便于我阅读。

## 13. Nitro v3 接口开发技能规范

本项目使用 Nitro v3 框架编写服务端接口。详细的开发规范请参阅：

**技能文件**：[.claude/skills/use-nitro.md](.claude/skills/use-nitro.md)

该技能文件包含：

- 目录结构规范（扁平结构 / 模块化结构）
- 核心规范（导入模块、公共类型、API 处理器工具函数）
- 接口模板（`defineApiHandler`、`defineSimpleHandler`）
- 错误处理（`HTTPError`、`badRequest`、`notFound` 等辅助函数）
- Nitro 配置与部署
- 核心函数速查表

## 14. 开发工具

- **commitlint** - 使用 `@ruan-cat/commitlint-config` 进行提交信息校验
- **commitizen/cz-git** - 交互式提交工具（通过 `.czrc` 配置）
- **taze** - 使用 `@ruan-cat/taze-config` 进行依赖更新检查
- **rolldown** - 构建工具（测试版）

## 15. 学习目标（来自 README）

本项目作为学习环境，用于学习：

- Neon 数据库集成
- Drizzle ORM
- 使用 Nitro 进行全栈开发
