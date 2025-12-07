import * as path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	resolve: {
		alias: {
			"@domain": path.resolve(__dirname, "src", "domain"),
			"@use-cases": path.resolve(__dirname, "src", "use-cases"),
			"@adapters": path.resolve(__dirname, "src", "adapters"),
			"@infrastructure": path.resolve(__dirname, "src", "infrastructure"),
		},
	},
});
