import { defineConfig } from "nitro";

// https://nitro.build/config
export default defineConfig({
  // 不推荐 应该在 nitro 的 build 命令内指定 preset
  // preset: "vercel",
  compatibilityDate: "latest",
  serverDir: "server",
  imports: false,

  devServer: {
    port: 8080,
  },

  /**
   * 配置 cloudflare worker 部署
   * @see https://nitro.build/deploy/providers/cloudflare#cloudflare-workers
   */
  cloudflare: {
    deployConfig: true,
    nodeCompat: true,
    wrangler: {
      // 设置 worker 名称
      name: "learn-nitro-starter-with-vercel",
    },
  },
});
