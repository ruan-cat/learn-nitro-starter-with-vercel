# 入门 drizzle 和 neon

我想在本项目内初始化基础的 drizzle 和 neon 数据库。并且希望在初始化这些基础工具时，学习这两个东西。我是完全的新手，不懂这两个东西。

请为我初始化这些配置。并且考虑教我知识点。

至少要教会我这些东西：

1. 我需要掌握那些全新的基础概念？
2. drizzle 怎么去定义、新建、维护、更新数据库表？
3. 怎么去生成数据库表字段？
4. 用什么命令去更新数据库表字段？
5. 怎么去回滚数据库的数据记录？

我非常熟悉以下内容：

1. 熟悉 vite、typescript、vitest、vue 等纯前端领域知识点。
2. 完全没有接触过 react、next 之类的技术框架。
3. 略微了解 nuxt 知识点。并避免自己使用 nuxt。
4. 了解 nitro v3 的使用，并希望高强度使用 nitro v3 而不是直接使用 nuxt 框架。

其他内容：

1. 我的 neon 数据库是在 vercel 连接的。

## 001 模仿参考 nuxt 的初始化教程，制作获取数据库版本的 api

阅读以下 url 链接图片：

![2026-01-21-23-21-30](https://s2.loli.net/2026/01/21/ZY38trM1ygboQxF.png)

![2026-01-21-23-21-47](https://s2.loli.net/2026/01/21/yWGbrYP1ms6qXSQ.png)

![2026-01-21-23-22-05](https://s2.loli.net/2026/01/21/Upo3m9nKLcRf5zA.png)

1. 编写合适的 `package.json` 命令，从 vercel 内拉取环境变量。
2. 在 `README.md` 内补充命令使用说明和对应 cli 官方文档参考链接。
3. 确保 `server\db\index.ts` 可以从正确的位置获取环境变量。
4. 我们项目毕竟不是 nuxt，请你在 index.html 内编写合适代码，请求接口、并显示数据库版本信息。

## 002 担心 vercel 在生产环境没办法获取到合适的环境变量

注意到 `drizzle.config.ts` 文件。这个文件会获取到环境变量。

目前 neon 的环境变量都来自于 vercel。首先使用 vercel link，然后获取到了本地环境变量 `.env.local` ，这里面都是 neon 数据库的链接字符串。

我不清楚在 `drizzle.config.ts` 内，怎么确保获取的环境变量始终是最正确的变量，请问 `dotenv` 怎么确保在本地开发和 vercel 云环境内都能够获取到正确的环境变量呢？

另外，我记得 `dotenv` 这个包好像弃用了。有一个新的官方包可以替换，用 `@dotenvx/dotenvx` 。请帮我替换掉。
