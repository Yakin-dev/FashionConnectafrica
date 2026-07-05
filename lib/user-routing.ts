import { Role } from "@prisma/client";

export function getDashboardRouteForUser(user: { role: Role; status: string; userType?: string | null }) {
  const roleRedirects: Record<string, string> = {
    MODEL: "/dashboard/model",
    AGENCY: "/dashboard/agency",
    CLIENT: "/dashboard/client",
    ADMIN: "/dashboard/admin",
    MARKETPLACE_PROVIDER: "/marketplace",
    MAKEUP_ARTIST: "/marketplace",
    FASHION_STYLIST: "/marketplace",
    HAIR_STYLIST: "/marketplace",
    VIDEOGRAPHER: "/marketplace",
  };

  // Route event_organizer to client dashboard
  if (user.userType === "event_organizer") {
    return "/dashboard/client";
  }

  if (user.status === "PENDING" && user.role === "MODEL") {
    return roleRedirects[user.role] ?? "/";
  }

  // Agency with PENDING review status still goes to agency dashboard (limited view)
  if (user.status === "PENDING" && user.role === "AGENCY") {
    return "/dashboard/agency";
  }

  return roleRedirects[user.role] ?? "/";
}
