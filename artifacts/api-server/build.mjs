import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { rm, readFile } from "node:fs/promises";

// Some bundled packages may use `require` - keep it available
globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  // Read package.json to auto-generate external list from dependencies
  const pkgJson = JSON.parse(
    await readFile(path.resolve(artifactDir, "package.json"), "utf-8")
  );

  // Externalize all npm packages (not @workspace/* â€” those get bundled)
  // This dramatically speeds up the build: 70s -> ~5s
  const npmExternals = [
    ...Object.keys(pkgJson.dependencies || {}).filter(
      (dep) => !dep.startsWith("@workspace/")
    ),
    ...Object.keys(pkgJson.devDependencies || {}).filter(
      (dep) => !dep.startsWith("@workspace/")
    ),
  ];

  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      // All npm packages â€” node_modules will be available at runtime
      ...npmExternals,
      // Native/unbundleable modules
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "bufferutil",
      "utf-8-validate",
      "pg-native",
    ],
    sourcemap: "linked",
    // ESM interop: allow bundled code (workspace packages) to use require/CJS
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});