# 提示词文件

## 001 升级依赖

1. - https://v3.nitro.build/docs/migration 请阅读 nitro v3 版本的升级指南。
2. 按照迁移指南，升级迁移本项目。

## 002 初始化基于 git 提交后的 prettier 格式化流程

请你阅读以下 github 仓库：

- https://github.com/nwt-q/001-Smart-Community/tree/dev-rc
- https://github.com/ruan-cat/monorepo/tree/dev

重点阅读以下文件：

- lint-staged.config.js
- prettier.config.mjs
- simple-git-hooks.mjs

重点关注以下依赖：

- prettier
- @prettier/plugin-oxc
- prettier-plugin-lint-md
- lint-staged
- simple-git-hooks
- commitlint

我需要你帮我在本项目内，初始化基于 `lint-staged` + `simple-git-hooks` + `prettier` 的 git 提交后触发格式化的流程。

你必须帮我做到以下内容：

1. 封装有意义的 `lint-staged.config.js` 文件。
2. 封装独立的 `prettier` 格式化命令。
   - 必须使用 `--experimental-cli` 参数来格式化代码
3. 封装 `prettier.config.mjs` 配置。按照上述仓库所体现的固定配置来编写固定格式的配置。
4. 封装 `simple-git-hooks.mjs` 配置。按照上述仓库所体现的固定配置来编写固定格式的配置。

### 01 总结经验，整理成一份可以任意初始化任何 node 项目的 claude code skills 技能，便于复用该能力

封装技能的内容要求：

1. 要说明清楚必须要安装的 node 依赖有哪一些。并统一安装为 `devDependencies` 。
2. 说明清楚必须要初始化、新建、或迭代修改的配置文件有哪一些。
3. 说明清楚 package.json 内要新增的命令有哪些。
4. 提供自检清单，检查一揽子初始化配置是否完成了。

封装技能的文件管理要求：

1. 会涉及到很多固定格式的配置项模板，涉及到的模板，请存放在对应技能目录的 `templates` 目录下面。

封装技能的格式要求：

1. 要能够使用命令的形式来主动触发。使用命令的形式主动触发技能。补全相关的 yaml 配置。

关于编写 claude code skill 的知识点如下，务必确保你充分阅读了 claude code skills 的编写格式：

- 编写语法与格式： https://code.claude.com/docs/zh-CN/skills
- 最佳实践： https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices
- 规范文档： https://agentskills.io/home

## 003 精简、优化、改造 nitro-api-development 技能为通用技能

请你深度阅读 `.claude\skills\nitro-api-development` 目录内的技能。对比本项目这个比较全新的，干净的 nitro 场景，将特化的，专门的 nitro 做法找出来。并想办法改造成一个通用的，面向从零开始项目的，skills 技能文档。

将你找到的特化项，专用项，全部找出来，并用 claude code 询问的交互式询问工具询问我，那些相互需要我审核并删除。

## 004 ccs 在 window 系统内出现严重故障

我选择方案 1，编写一个 ccs issue，请求对方更改代码。使用 window 系统，适配 window 系统。请你在 docs/issue 目录内编写 issue 草稿，由于对方是以英语为母语的用户，所以我需要你同时编写两份语言的 issue 稿

一份是全中文的，给我看
另一份是全英文的，给维护者看。

务必要说明清楚故障的前因后果。说明清楚我在 window 系统内，使用 pnpm 全局安装的 gemini 包可以正常使用，但是在 `lib\hooks\websearch-transformer.cjs` 这个脚本内 isCliAvailable 函数能完成脚本识别，但是执行时 spawnSync 却出现了兼容性故障。故需要改造。

### 01

1. 检查 `C:\Users\pc\.ccs\hooks\websearch-transformer.cjs` 代码。
2. 在运行 gemini 的时候，出现以下错误：

```log
Cannot use both a positional prompt and the
     --prompt (-p) flag together
     Usage: gemini [options] [command]

     Gemini CLI - Launch an interactive CLI, use -p/--prompt for
     non-interactive mode
```

请问是不是配置出问题了？参数不合适么？

### 02

1. 检查 `C:\Users\pc\.ccs\hooks\websearch-transformer.cjs` 代码。
2. 在使用搜索工具 WebSearch 并用 gemini 代完成联网搜索的时候，出现以下错误：

```log
Error: [WebSearch - All Providers Failed]

     Tried all enabled CLI tools but all failed:
       - Gemini CLI: [ERROR] [ImportProcessor] Failed to import
     ruan-cat/commitlint-config: ENOENT: no such file or directory,
     access 'D:\code\github-desktop-store\learn-nitro-starter-with-ve     cel__ruan-cat\ruan-cat\commitlint-config'
     [ERROR] [ImportProcessor] Failed to import changesets/cli:
     ENOENT: no such file or directory, access 'D:\code\github-deskto     -store\learn-nitro-starter-with-vercel__ruan-cat\changesets\cli'     YOLO mode is enabled. All tool calls will be automatically
     approved.
     When using Gemini API, you must specify the GEMINI_API_KEY
     environment variable.
     Update your environment and try again (no reload needed if using     .env)!
```

### 03 对 gemini 的认证很疑惑

1. 阅读 https://github.com/ruan-cat/monorepo/blob/main/claude-code-marketplace/common-tools/scripts/task-complete-notifier.sh 文件。
2. 这个钩子同样是不需要使用 gemini 的登录验证的。为什么我提供的这个脚本内，直接使用 gemini 不会出现需要登录验证的情况，而 `C:\Users\pc\.ccs\hooks\websearch-transformer.cjs` 代码却需要验证呢？
