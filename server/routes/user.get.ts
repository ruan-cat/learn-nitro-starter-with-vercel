/**
 * @file 示例用户接口
 * @description Example user API
 * GET /user
 */

import { defineSimpleHandler } from "../utils/api";

export default defineSimpleHandler(() => ({
	name: "John Doe",
	age: 20,
	email: "john.doe@example.com",
}));
