/**
 * @file 服务端公共类型定义
 * @description Server-side common type definitions
 */

/** 基础 API 响应结构 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	message?: string;
	data?: T;
}

/** 分页查询参数 */
export interface PageParams {
	pageIndex: number;
	pageSize: number;
}

/** 分页数据结构 */
export interface PageData<T> {
	list: T[];
	total: number;
	pageIndex: number;
	pageSize: number;
	totalPages: number;
}

/** 分页响应结构 */
export type PageResponse<T> = ApiResponse<PageData<T>>;
