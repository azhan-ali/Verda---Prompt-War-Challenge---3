import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    redirect("/");
  }

  // Calculate beginning of today in user's timezone/local start
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const activities = await prisma.activity.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfToday,
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  const todayEmissionsKg = activities.reduce((sum, act) => sum + act.totalKg, 0);

  // Serialize dates for safe client hydration
  const serializedActivities = activities.map((act) => ({
    id: act.id,
    description: act.description,
    transportKg: act.transportKg,
    foodKg: act.foodKg,
    energyKg: act.energyKg,
    totalKg: act.totalKg,
    date: act.date.toISOString(),
  }));

  return (
    <DashboardClient
      session={session}
      todayEmissionsKg={Number(todayEmissionsKg.toFixed(3))}
      initialActivities={serializedActivities}
    />
  );
}
