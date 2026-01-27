/**
 * @file 数据库健康检查接口
 * @description Database health check API
 * GET /health
 */

import { defineApiHandler } from "../utils/api";
import { db } from "../db";
import { sql } from "drizzle-orm";

export default defineApiHandler(
	async () => {
		const result = await db.execute(sql`SELECT NOW() as current_time`);
		return {
			timestamp: result.rows[0]?.current_time,
			message: "数据库连接正常",
		};
	},
	{ errorMessage: "数据库连接失败" },
);
