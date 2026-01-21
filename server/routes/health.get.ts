import { eventHandler } from "nitro/h3";
import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * 数据库健康检查 API
 *
 * GET /api/health
 * 用于验证数据库连接是否正常
 */
export default eventHandler(async () => {
  try {
    const result = await db.execute(sql`SELECT NOW() as current_time`);
    return {
      success: true,
      message: "数据库连接正常",
      timestamp: result.rows[0]?.current_time,
    };
  } catch (error) {
    return {
      success: false,
      message: "数据库连接失败",
      error: error instanceof Error ? error.message : "未知错误",
    };
  }
});
