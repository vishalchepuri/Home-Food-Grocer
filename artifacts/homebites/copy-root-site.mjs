import fs from "node:fs";
import path from "node:path";

const source = path.resolve(import.meta.dirname, "root-site");
const target = path.resolve(import.meta.dirname, "dist/public");

fs.mkdirSync(target, { recursive: true });
fs.cpSync(source, target, { recursive: true });

console.log(`Copied root site from ${source} to ${target}`);
