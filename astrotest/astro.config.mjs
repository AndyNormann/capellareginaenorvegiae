// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	experimental: {
		rustCompiler: true,
		queuedRendering: {
			enabled: true
		}
	},
	vite: {
		plugins: [tailwindcss()]
	}
});
