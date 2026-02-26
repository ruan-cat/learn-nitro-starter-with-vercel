/**
 * @file 用户列表接口
 * @description User list API
 * GET /users
 */

import { defineApiHandler } from "../utils/api";
import { db, usersTable } from "../db";

export default defineApiHandler(
	async () => {
		return await db.select().from(usersTable);
	},
	{ errorMessage: "获取用户列表失败" },
);
