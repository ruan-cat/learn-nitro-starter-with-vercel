import { eventHandler } from "nitro/h3";
import { db, usersTable } from "../db";
import { eq } from "drizzle-orm";

/**
 * 用户列表 API
 *
 * GET /api/users
 * 返回所有用户列表
 */
export default eventHandler(async () => {
	const users = await db.select().from(usersTable);
	return {
		success: true,
		data: users,
	};
});
