import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const publicDir = join(projectRoot, "public");

rmSync(publicDir, { recursive: true, force: true });
mkdirSync(publicDir, { recursive: true });

cpSync(join(projectRoot, "index.html"), join(publicDir, "index.html"));
cpSync(join(projectRoot, "calculator.js"), join(publicDir, "calculator.js"));

console.log("Static build ready in public/");
