import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

// Load .env.local manually for the test environment
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*["']?(.*?)["']?\s*$/);
    if (match) {
      const [, key, value] = match;
      process.env[key] = value;
    }
  });
}

describe("NextAuth Configuration", () => {
  it("should have PrismaAdapter as adapter", async () => {
    const { authOptions } = await import("../lib/auth");
    expect(authOptions.adapter).toBeDefined();
  });

  it("should use JWT session strategy", async () => {
    const { authOptions } = await import("../lib/auth");
    expect(authOptions.session?.strategy).toBe("jwt");
  });

  it("should contain Google and Credentials providers", async () => {
    const { authOptions } = await import("../lib/auth");
    expect(authOptions.providers).toHaveLength(2);
    expect(authOptions.providers[0].id).toBe("google");
    expect(authOptions.providers[1].id).toBe("credentials");
  });
});

describe("Prisma Client", () => {
  it("should be defined and exportable", async () => {
    const { prisma } = await import("../lib/prisma");
    expect(prisma).toBeDefined();
    const users = await prisma.user.findMany();
    expect(users).toBeDefined();
  }, 15000);
});
