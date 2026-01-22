import { integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

/**
 * 用户表 Schema 定义
 *
 * 这是一个示例表，用于演示 Drizzle ORM 的基本用法
 * - serial: 自增主键
 * - text: 文本字段
 * - integer: 整数字段
 * - timestamp: 时间戳字段
 */
export const usersTable = pgTable("users", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	age: integer("age"),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdate(() => new Date()),
});

/**
 * 文章表 Schema 定义
 *
 * 演示表之间的关联关系（外键）
 */
export const postsTable = pgTable("posts", {
	id: serial("id").primaryKey(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	userId: integer("user_id")
		.notNull()
		.references(() => usersTable.id, { onDelete: "cascade" }),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at")
		.notNull()
		.$onUpdate(() => new Date()),
});

/** 用户表插入类型 */
export type InsertUser = typeof usersTable.$inferInsert;

/** 用户表查询类型 */
export type SelectUser = typeof usersTable.$inferSelect;

/** 文章表插入类型 */
export type InsertPost = typeof postsTable.$inferInsert;

/** 文章表查询类型 */
export type SelectPost = typeof postsTable.$inferSelect;
