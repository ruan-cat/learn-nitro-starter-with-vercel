import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  // 不推荐 应该在 nitro 的 build 命令内指定 preset
  // preset: "vercel",
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,

  /**
   * 配置 cloudflare worker 部署
   * @see https://nitro.build/deploy/providers/cloudflare#cloudflare-workers
   */
  cloudflare: {
    // deployConfig: false,
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      name: "learn-nitro-starter-with-vercel",
      // 失效
      compatibility_date: "2025-09-13",
    },
  },
});
