import * as path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
			"@domain": path.resolve(__dirname, "src_clean_architecture", "domain"),
			"@use-cases": path.resolve(__dirname, "src_clean_architecture", "use-cases"),
			"@adapters": path.resolve(__dirname, "src_clean_architecture", "adapters"),
			"@infrastructure": path.resolve(__dirname, "src_clean_architecture", "infrastructure"),
		},
	},
});
