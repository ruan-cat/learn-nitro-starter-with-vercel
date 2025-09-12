import { defineNitroConfig } from "nitropack/config";

// https://nitro.build/config
export default defineNitroConfig({
  preset: "vercel",
  compatibilityDate: "latest",
  srcDir: "server",
  imports: false,
});
