import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      city?: string | null;
      dailyBudgetKg: number;
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    city?: string | null;
    dailyBudgetKg: number;
  }
}
