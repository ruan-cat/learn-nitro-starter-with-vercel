import { eventHandler, readBody } from "nitro/h3";
import { db, usersTable } from "../db";
import type { InsertUser } from "../db";

/**
 * 创建用户 API
 *
 * POST /api/users
 * 请求体: { name: string, email: string, age?: number }
 */
export default eventHandler(async (event) => {
	const body = await readBody<InsertUser>(event);

	if (!body.name || !body.email) {
		return {
			success: false,
			error: "name 和 email 是必填字段",
		};
	}

	const newUser = await db
		.insert(usersTable)
		.values({
			name: body.name,
			email: body.email,
			age: body.age,
		})
		.returning();

	return {
		success: true,
		data: newUser[0],
	};
});
