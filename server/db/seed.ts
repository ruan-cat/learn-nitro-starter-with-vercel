import { config } from "@dotenvx/dotenvx";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { usersTable, postsTable } from "./schema";

// 加载环境变量
config();

if (!process.env.DATABASE_URL) {
	throw new Error("DATABASE_URL is not defined");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seed() {
	console.log("🌱 开始填充种子数据...");

	try {
		// 1. 清理现有数据 (可选，根据需求)
		// await db.delete(postsTable);
		// await db.delete(usersTable);

		// 2. 插入用户
		console.log("正在插入用户...");
		const users = await db
			.insert(usersTable)
			.values([
				{
					name: "Alice",
					email: "alice@example.com",
					age: 25,
				},
				{
					name: "Bob",
					email: "bob@example.com",
					age: 30,
				},
				{
					name: "Charlie",
					email: "charlie@example.com",
					age: 35,
				},
			])
			.returning();

		console.log(`✅ 已创建 ${users.length} 个用户`);

		// 3. 为每个用户插入文章
		console.log("正在插入文章...");
		const posts = [];

		for (const user of users) {
			const userPosts = await db
				.insert(postsTable)
				.values([
					{
						title: `${user.name} 的第一篇文章`,
						content: `这是 ${user.name} 写的关于 Drizzle 的第一篇文章内容。`,
						userId: user.id,
					},
					{
						title: `${user.name} 的生活感悟`,
						content: `今天天气真不错，${user.name} 觉得很开心。`,
						userId: user.id,
					},
				])
				.returning();
			posts.push(...userPosts);
		}

		console.log(`✅ 已创建 ${posts.length} 篇文章`);
		console.log("🎉 种子数据填充完成！");
	} catch (error) {
		console.error("❌ 填充失败:", error);
		process.exit(1);
	}
}

seed();
