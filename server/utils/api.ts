/**
 * @file API 处理器工具函数
 * @description API handler utilities with automatic response wrapping and error handling
 */

import { defineHandler, HTTPError } from "nitro/h3";
import type { H3Event } from "nitro/h3";
import type { ApiResponse } from "../types";

interface HandlerOptions {
	/** 成功时的消息（可选） */
	successMessage?: string;
	/** 错误时的默认消息 */
	errorMessage?: string;
}

/**
 * 创建业务错误（400 Bad Request）
 * @example throw badRequest("name 和 email 是必填字段")
 */
export function badRequest(message: string): HTTPError {
	return new HTTPError({ status: 400, message });
}

/**
 * 创建未授权错误（401 Unauthorized）
 * @example throw unauthorized("请先登录")
 */
export function unauthorized(message = "未授权"): HTTPError {
	return new HTTPError({ status: 401, message });
}

/**
 * 创建禁止访问错误（403 Forbidden）
 * @example throw forbidden("无权访问此资源")
 */
export function forbidden(message = "禁止访问"): HTTPError {
	return new HTTPError({ status: 403, message });
}

/**
 * 创建资源未找到错误（404 Not Found）
 * @example throw notFound("用户不存在")
 */
export function notFound(message = "资源不存在"): HTTPError {
	return new HTTPError({ status: 404, message });
}

/**
 * 创建服务器内部错误（500 Internal Server Error）
 * @example throw serverError("数据库连接失败")
 */
export function serverError(message = "服务器内部错误"): HTTPError {
	return new HTTPError({ status: 500, message });
}

/**
 * 定义 API 处理器，自动包装响应格式和错误处理
 * @example defineApiHandler(async () => await db.select().from(users))
 */
export function defineApiHandler<T>(handler: (event: H3Event) => Promise<T> | T, options?: HandlerOptions) {
	return defineHandler(async (event): Promise<ApiResponse<T>> => {
		try {
			const data = await handler(event);
			const response: ApiResponse<T> = { success: true, data };
			if (options?.successMessage) {
				response.message = options.successMessage;
			}
			return response;
		} catch (err) {
			const message = err instanceof Error ? err.message : (options?.errorMessage ?? "操作失败");
			return { success: false, message };
		}
	});
}

/**
 * 定义简单 API 处理器（无数据库操作，不需要错误处理）
 * @example defineSimpleHandler(() => ({ name: "John" }))
 */
export function defineSimpleHandler<T>(handler: (event: H3Event) => Promise<T> | T, options?: HandlerOptions) {
	return defineHandler(async (event): Promise<ApiResponse<T>> => {
		const data = await handler(event);
		const response: ApiResponse<T> = { success: true, data };
		if (options?.successMessage) {
			response.message = options.successMessage;
		}
		return response;
	});
}
