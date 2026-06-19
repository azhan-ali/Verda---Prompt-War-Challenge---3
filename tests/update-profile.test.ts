import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/user/update-profile/route";
import { prisma } from "../lib/prisma";
import { getServerSession } from "next-auth";

vi.mock("next-auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-auth")>();
  return {
    ...actual,
    getServerSession: vi.fn(),
  };
});

vi.mock("../lib/prisma", () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

describe("POST /api/user/update-profile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/user/update-profile", {
      method: "POST",
      body: JSON.stringify({ city: "Delhi" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if city is invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@example.com" },
    } as any);

    const req = new Request("http://localhost/api/user/update-profile", {
      method: "POST",
      body: JSON.stringify({ city: "City123!" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Invalid fields");
  });

  it("should return 200 and update database if request is valid", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@example.com" },
    } as any);

    vi.mocked(prisma.user.update).mockResolvedValueOnce({
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      city: "Delhi",
      dailyBudgetKg: 10.0,
      createdAt: new Date(),
    } as any);

    const req = new Request("http://localhost/api/user/update-profile", {
      method: "POST",
      body: JSON.stringify({ city: "Delhi", dailyBudgetKg: 10 }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.message).toBe("Profile updated successfully");
    expect(data.user.city).toBe("Delhi");
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { city: "Delhi", dailyBudgetKg: 10 },
    });
  });
});
