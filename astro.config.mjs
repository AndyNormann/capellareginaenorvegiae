// @ts-check
import { defineConfig } from "astro/config";
import { envField } from "astro/config";

import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://capellareginae.no",
  integrations: [sitemap()],
  redirects: {
    "/no": "/",
    "/no/": "/",
  },
  experimental: {
    rustCompiler: true,
    queuedRendering: {
      enabled: true,
    },
  },
  env: {
    schema: {
      VIPPS_CLIENT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      VIPPS_CLIENT_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      VIPPS_SUBSCRIPTION_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      VIPPS_MSN: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
