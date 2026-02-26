/**
 * @file 创建用户接口
 * @description Create user API
 * POST /users
 */

import { readBody } from "nitro/h3";
import { defineApiHandler, badRequest } from "../utils/api";
import { db, usersTable } from "../db";
import type { InsertUser } from "../db";

export default defineApiHandler(
	async (event) => {
		const body = await readBody<InsertUser>(event);

		if (!body.name || !body.email) {
			throw badRequest("name 和 email 是必填字段");
		}

		const [newUser] = await db
			.insert(usersTable)
			.values({
				name: body.name,
				email: body.email,
				age: body.age,
			})
			.returning();

		return newUser;
	},
	{ successMessage: "创建成功", errorMessage: "创建用户失败" },
);
