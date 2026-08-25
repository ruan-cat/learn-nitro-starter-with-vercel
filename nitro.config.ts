import { defineConfig } from "nitro";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pkg from "./package.json" with { type: "json" };

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://nitro.build/config
export default defineConfig({
	// 不推荐 应该在 nitro 的 build 命令内指定 preset
	// preset: "vercel",

	compatibilityDate: {
		// https://v3.nitro.build/deploy/providers/cloudflare
		cloudflare: "2024-09-19",
		// https://nitro.build/deploy/providers/vercel#observability
		vercel: "2024-09-19",
	},

	// 使用绝对路径配置别名
	alias: {
		"@": path.resolve(__dirname, "src"),
		server: path.resolve(__dirname, "server"),
	},

	experimental: {
		openAPI: true,
	},

	openAPI: {
		meta: {
			title: "learn-nitro-starter API",
			description: "Nitro v3 学习项目接口文档",
			version: pkg.version,
		},
		production: "prerender",
		route: "/openapi.json",
		ui: {
			scalar: {
				route: "/scalar",
			},
		},
	},

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
