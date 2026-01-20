<!-- 从gemini网页版询问的初始化教程 -->

你好！很高兴看到你已经成功运行了 Nitro v3 并准备探索全栈开发。作为一个熟悉 Vue 生态但初次接触后端数据库的开发者，Drizzle ORM + Neon 是一个非常现代且开发者体验极佳的组合（被称为 "The Modern Stack"）。

由于你的 `nitro.config.ts` 中设置了 `imports: false`，我们在代码中将使用**显式导入**的方式，这其实更适合新手理解代码的依赖关系。

以下是为你定制的 Drizzle + Neon 入门指南。

### 第一步：安装依赖

在项目根目录下运行以下命令安装必要的库：

```bash
# 核心依赖：ORM 库和 Neon 的 Serverless 驱动
pnpm add drizzle-orm @neondatabase/serverless dotenv

# 开发依赖：Drizzle 的命令行工具（用于生成迁移文件）
pnpm add -D drizzle-kit

```

### 第二步：理解基础概念 (回答问题 1)

在你开始写代码前，先理解这几个核心概念：

1. **Schema (模式)**: 这是你的**真理之源**。你在 TypeScript 文件里定义数据库长什么样（有哪些表、字段、类型）。Drizzle 会根据这个文件去操作数据库。
2. **Migration (迁移)**: 这是一个记录数据库变更历史的过程。当你修改了 Schema（比如加了一个字段），Drizzle 会生成一个 SQL 文件（迁移文件），记录下“如何从上一个状态变更到当前状态”。
3. **Driver (驱动)**: 连接数据库的桥梁。在这里我们使用 Neon 的 Serverless 驱动，它通过 HTTP/WebSockets 连接，非常适合 Vercel/Cloudflare 环境。

### 第三步：初始化配置

我们需要配置 Drizzle 让他知道你的数据库在哪里，以及 Schema 文件在哪里。

1. **获取连接字符串**:

- 既然你在 Vercel 上连接了 Neon，在 Vercel 的项目设置 -> Environment Variables 中应该能找到 `DATABASE_URL`。
- **本地开发**: 请在项目根目录新建一个 `.env` 文件，并将 `DATABASE_URL` 粘贴进去。

```env
# .env
DATABASE_URL='你的_neon_连接_字符串'

```

2. **创建配置文件**: 在根目录创建 `drizzle.config.ts`。

```typescript
// drizzle.config.ts
import { defineConfig } from "drizzle-kit";
import "dotenv/config";

export default defineConfig({
  schema: "./server/database/schema.ts", // 指定 Schema 文件位置
  out: "./server/database/migrations", // 指定迁移文件输出位置
  dialect: "postgresql", // 数据库类型
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

### 第四步：定义数据库表 (回答问题 2 & 3)

我们来定义第一张表。建议将所有数据库相关文件放在 `server/database` 目录下。

新建文件 `server/database/schema.ts`：

```typescript
// server/database/schema.ts
import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// 定义一张名为 'users' 的表
export const users = pgTable("users", {
  // serial: 自增主键
  id: serial("id").primaryKey(),

  // text: 文本类型，notNull 表示必填
  name: text("name").notNull(),

  // email: 文本类型，必须唯一
  email: text("email").notNull().unique(),

  // integer: 整数类型
  age: integer("age"),

  // timestamp: 时间戳，默认当前时间
  createdAt: timestamp("created_at").defaultNow(),
});
```

- **怎么定义？** 使用 `pgTable` 函数。
- **怎么生成字段？** 使用 `text()`, `integer()`, `serial()` 等函数链式调用配置（如 `.notNull()`）。

### 第五步：连接数据库

新建文件 `server/database/db.ts`，用于初始化数据库连接实例：

```typescript
// server/database/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// 确保在运行时能获取到环境变量
const sql = neon(process.env.DATABASE_URL!);

// 导出 db 实例，后续在 API 中都用这个
export const db = drizzle(sql, { schema });
```

### 第六步：更新数据库表结构 (回答问题 4)

当你写好了 `schema.ts`，数据库里其实还什么都没有。你需要把这个 TypeScript 定义“同步”到数据库。

这是标准的**迁移流程**（两步走）：

1. **生成迁移文件 (Generate)**: 让 Drizzle 对比你的 Schema 和之前的快照，生成 SQL 变更文件。

```bash
npx drizzle-kit generate

```

_运行后，你会发现在 `server/database/migrations` 下多了一个 `.sql` 文件。_ 2. **执行迁移 (Migrate)**: 将生成的 SQL 执行到真正的 Neon 数据库中。

```bash
npx drizzle-kit migrate

```

**日常开发工作流**：
修改 `schema.ts` -> 运行 `generate` -> 运行 `migrate` -> 数据库更新完成。

### 第七步：实战 - 在 Nitro 中使用

让我们修改你现有的 `server/routes/user.get.ts`，把它变成从数据库读取数据。

你需要先手动插入一条数据到数据库（可以通过 Neon 控制台 SQL 编辑器），或者我们可以写一个 POST 接口来创建数据。这里演示**查询**：

```typescript
// server/routes/user.get.ts
import { eventHandler } from "h3";
import { db } from "../database/db"; // 导入我们创建的 db 实例
import { users } from "../database/schema"; // 导入表定义

export default eventHandler(async (event) => {
  // 使用 Drizzle 查询所有用户
  const allUsers = await db.select().from(users);

  return {
    users: allUsers,
  };
});
```

### 回答问题 5：怎么回滚数据库的数据记录？

"回滚"在这个领域通常有两层含义，作为新手需要区分清楚：

1. **Schema 回滚 (撤销表结构的修改)**:
   如果你 `migrate` 了一个错误的字段，通常的做法是：修改 `schema.ts` 把那个字段删掉/改回来，然后再次运行 `generate` 和 `migrate`。这会生成一个新的 SQL 迁移文件来“修正”错误。这是最安全、最符合版本控制习惯的做法。
2. **数据事务回滚 (撤销代码操作)**:
   如果在代码执行过程中出错（比如：创建用户成功了，但发送欢迎邮件失败了，想要撤销创建用户），你需要使用**事务 (Transaction)**。

```typescript
// 示例：事务回滚
await db.transaction(async (tx) => {
  // 1. 创建用户
  await tx.insert(users).values({ name: "Ruan", email: "ruan@example.com" });

  // 2. 模拟一个错误
  if (somethingWrong) {
    // 抛出错误会自动触发回滚，上面的插入操作会被撤销，仿佛从未发生过
    throw new Error("邮件发送失败，回滚！");
  }
});
```

### 总结 Checklist

1. **安装**: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`。
2. **配置**: `.env` (DATABASE_URL) 和 `drizzle.config.ts`。
3. **开发**: 修改 `schema.ts`。
4. **同步**: `npx drizzle-kit generate` -> `npx drizzle-kit migrate`。
5. **使用**: `import { db }` -> `db.select()...`。

快去试试吧！如果有报错，通常是因为 `.env` 没读取到或者连接字符串格式不对。
