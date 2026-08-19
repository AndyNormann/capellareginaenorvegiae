// @ts-check
import { defineConfig } from "astro/config";
import { envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://andynormann.github.io",
  base: "/capellareginaenorvegiae",
  integrations: [sitemap()],
  experimental: {
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },
  env: {
    schema: {
      VIPPS_CLIENT_ID: envField.string({ context: "server", access: "secret" }),
      VIPPS_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
      }),
      VIPPS_SUBSCRIPTION_KEY: envField.string({
        context: "server",
        access: "secret",
      }),
      VIPPS_MSN: envField.string({ context: "server", access: "secret" }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
