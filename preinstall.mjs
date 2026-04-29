import fs from "node:fs";
import path from "node:path";

// Root preinstall hook for this monorepo.
// - Removes lockfiles that conflict with pnpm.
// - Ensures the install is being run with pnpm (not npm/yarn).

const lockfiles = ["package-lock.json", "yarn.lock"];
for (const file of lockfiles) {
  try {
    fs.rmSync(path.join(process.cwd(), file), { force: true });
  } catch {
    // Ignore missing files or fs permission issues; pnpm will handle the rest.
  }
}

const ua = process.env.npm_config_user_agent ?? "";
if (!ua.startsWith("pnpm/")) {
  console.error("Use pnpm instead");
  process.exit(1);
}