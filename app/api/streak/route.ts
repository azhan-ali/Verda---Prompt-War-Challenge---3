import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user daily budget (defaults to 5.0)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dailyBudgetKg: true }
    });
    const budget = user?.dailyBudgetKg ?? 5.0;

    // Calculate start date: 30 days ago (inclusive of today)
    const startOfStreakRange = new Date();
    startOfStreakRange.setDate(startOfStreakRange.getDate() - 29);
    startOfStreakRange.setHours(0, 0, 0, 0);

    // Fetch activities in range
    const activities = await prisma.activity.findMany({
      where: {
        userId,
        date: {
          gte: startOfStreakRange
        }
      },
      orderBy: {
        date: "asc"
      }
    });

    // Initialize 30-day map with "grey" defaults
    const dayMap = new Map<string, { date: string; totalKg: number; status: "green" | "red" | "grey" }>();
    const tempDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const key = formatDateKey(tempDate);
      dayMap.set(key, { date: key, totalKg: 0, status: "grey" });
      tempDate.setDate(tempDate.getDate() - 1);
    }

    // Populate actual activity calculations
    for (const act of activities) {
      const key = formatDateKey(act.date);
      const dayEntry = dayMap.get(key);
      if (dayEntry) {
        dayEntry.totalKg = Number((dayEntry.totalKg + act.totalKg).toFixed(2));
        dayEntry.status = dayEntry.totalKg <= budget ? "green" : "red";
      }
    }

    // Calculate streak backwards from today
    let streak = 0;
    let checkDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const key = formatDateKey(checkDate);
      const dayEntry = dayMap.get(key);

      if (i === 0 && (!dayEntry || dayEntry.status === "grey")) {
        // Today is unlogged, skip today and start count from yesterday
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }

      if (dayEntry && dayEntry.status === "green") {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break; // Red or unlogged past day breaks the streak
      }
    }

    // Convert map to chronological array (oldest first)
    const history = Array.from(dayMap.values()).reverse();

    return NextResponse.json({
      success: true,
      streak,
      budget,
      history
    });
  } catch (error: any) {
    console.error("Error fetching streak history: ", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
