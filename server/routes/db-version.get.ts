/**
 * @file 获取数据库版本信息接口
 * @description Get PostgreSQL database version API
 * GET /db-version
 */

import { defineApiHandler } from "../utils/api";
import { db } from "../db";
import { sql } from "drizzle-orm";

export default defineApiHandler(
	async () => {
		const result = await db.execute(sql`SELECT version()`);
		return {
			version: result.rows[0]?.version as string,
		};
	},
	{ errorMessage: "获取数据库版本失败" },
);
