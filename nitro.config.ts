import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  // 不推荐 应该在 nitro 的 build 命令内指定 preset
  // preset: "vercel",
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,
});
