import { Role } from "@prisma/client";

export function getDashboardRouteForUser(user: { role: Role; status: string }) {
  const roleRedirects: Record<string, string> = {
    MODEL: "/dashboard/model",
    AGENCY: "/dashboard/agency",
    CLIENT: "/dashboard/client",
    ADMIN: "/dashboard/admin",
    MARKETPLACE_PROVIDER: "/marketplace",
  };

  if (user.status === "PENDING" && user.role === "MODEL") {
    // If pending logic is required, it can go here, but usually dashboard logic handles pending
    // For now, we will return the dashboard route. The specific dashboard can show a 'pending approval' state.
    return roleRedirects[user.role] ?? "/";
  }

  return roleRedirects[user.role] ?? "/";
}
