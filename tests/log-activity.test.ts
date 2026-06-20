import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../app/api/log-activity/route";
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
    activity: {
      create: vi.fn(),
    },
  },
}));

describe("POST /api/log-activity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if user is unauthorized", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce(null);

    const req = new Request("http://localhost/api/log-activity", {
      method: "POST",
      body: JSON.stringify({ text: "drove 15km petrol car" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    
    const data = await res.json();
    expect(data.error).toBe("Unauthorized");
  });

  it("should return 400 if text is missing or invalid", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@example.com" },
    } as unknown as import("next-auth").Session);

    const req = new Request("http://localhost/api/log-activity", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Missing required text field");
  });

  it("should sanitize the input text and extract emissions correctly using fallback", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@example.com" },
    } as unknown as import("next-auth").Session);

    // Mock Prisma activity creation dynamically
    vi.mocked(prisma.activity.create).mockImplementation(async ({ data }: { data: import("@prisma/client").Prisma.ActivityCreateArgs['data'] }) => {
      return {
        id: "activity-1",
        ...data,
        date: new Date()
      };
    });

    const req = new Request("http://localhost/api/log-activity", {
      method: "POST",
      body: JSON.stringify({ text: "drove 15km in petrol car <script>dangerous</script>" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.activity.description).toBe("drove 15km in petrol car scriptdangerousscript"); // tags stripped by sanitize
    expect(prisma.activity.create).toHaveBeenCalled();
  });

  it("should calculate correct totals for multiple categories", async () => {
    vi.mocked(getServerSession).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@example.com" },
    } as unknown as import("next-auth").Session);

    vi.mocked(prisma.activity.create).mockImplementation(async ({ data }: { data: import("@prisma/client").Prisma.ActivityCreateArgs['data'] }) => {
      return {
        id: "activity-2",
        ...data,
        date: new Date()
      };
    });

    const req = new Request("http://localhost/api/log-activity", {
      method: "POST",
      body: JSON.stringify({ text: "drove 10km in petrol car and had beef steak" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    // 10km * 0.17 petrolCar factor = 1.70 kg
    // 1 serving * 15.5 beef factor = 15.50 kg
    // Total = 17.20 kg
    expect(data.activity.transportKg).toBe(1.70);
    expect(data.activity.foodKg).toBe(15.50);
    expect(data.activity.totalKg).toBe(17.20);
  });
});
