import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";
import { getCityBaseline } from "../../../../lib/cityBaselines";
const updateProfileSchema = z.object({
  city: z.string().min(1, "City name cannot be empty").max(100, "City name is too long").regex(/^[a-zA-Z\s.-]+$/, "City name contains invalid characters"),
  dailyBudgetKg: z.number().positive().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = updateProfileSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid fields", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { city, dailyBudgetKg } = result.data;

    let finalBudgetKg = dailyBudgetKg;
    if (finalBudgetKg === undefined && city) {
      finalBudgetKg = getCityBaseline(city).baselineKg;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        city,
        ...(finalBudgetKg !== undefined ? { dailyBudgetKg: finalBudgetKg } : {}),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        city: updatedUser.city,
        dailyBudgetKg: updatedUser.dailyBudgetKg,
      },
    });
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
