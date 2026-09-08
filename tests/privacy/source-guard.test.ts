import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const sourceRoot = join(root, "src");
const prohibitedPatterns = [
  /\blocalStorage\b/,
  /\bsessionStorage\b/,
  /\bindexedDB\b/,
  /\bdocument\.cookie\b/,
  /@supabase\//,
  /firebase/,
  /appwrite/,
  /createTRPC/,
  /from\s+["']razorpay["']/,
  /checkout\.razorpay\.com/,
  /api\.razorpay\.com/,
  /rzp_(?:live|test)_/,
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory()
      ? sourceFiles(path)
      : [".ts", ".tsx"].includes(extname(path))
        ? [path]
        : [];
  });
}

describe("Phase 1 privacy boundary", () => {
  it("does not use persistent browser storage or backend SDKs", () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return prohibitedPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relative(root, path)}: ${pattern.source}`);
    });

    expect(violations).toEqual([]);
  });

  it("does not define product-data API routes", () => {
    const apiRoutes = sourceFiles(sourceRoot).filter((path) =>
      /[\\/]app[\\/]api[\\/].*route\.ts$/.test(path),
    );

    expect(apiRoutes).toEqual([]);
  });
});
