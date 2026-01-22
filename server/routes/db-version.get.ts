import { eventHandler } from "nitro/h3";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * 获取数据库版本信息 API
 *
 * GET /db-version
 * 返回 PostgreSQL 数据库版本信息
 *
 * @example 响应示例
 * {
 *   "success": true,
 *   "version": "PostgreSQL 16.2 on x86_64-pc-linux-gnu..."
 * }
 */
export default eventHandler(async () => {
	try {
		const result = await db.execute(sql`SELECT version()`);
		const version = result.rows[0]?.version as string;

		return {
			success: true,
			version,
		};
	} catch (error) {
		return {
			success: false,
			message: "获取数据库版本失败",
			error: error instanceof Error ? error.message : "未知错误",
		};
	}
});
