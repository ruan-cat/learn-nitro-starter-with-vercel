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

我需要你帮我在本项目内，初始化基于 `lint-staged` + `simple-git-hooks` + `prettier` 的 git 提交后触发格式化的流程。

### 01 总结经验，整理成一份可以任意初始化任何 node 项目的 claude code skills 技能，便于复用该能力

关于 claude code skill 的知识点：

- 编写语法与格式： https://code.claude.com/docs/zh-CN/skills
- 最佳实践： https://platform.claude.com/docs/zh-CN/agents-and-tools/agent-skills/best-practices
- 规范文档： https://agentskills.io/home
