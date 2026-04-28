import { fileURLToPath } from "url";
import { existsSync } from "fs";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// @tailwindcss/node uses enhanced-resolve starting from wrong base dir on Windows
// when the project path has a parent folder with no package.json.
// Override so packages are always resolved from project node_modules.
globalThis.__tw_resolve = (id, from) => {
  const pkgName = id.startsWith("@")
    ? id.split("/").slice(0, 2).join("/")
    : id.split("/")[0];
  const subpath = id.slice(pkgName.length) || "/index.css";
  const candidate = path.join(__dirname, "node_modules", pkgName, subpath);
  return existsSync(candidate) ? candidate : null;
};

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
