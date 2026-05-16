import type { UserProfile, UserRole } from "../types";

export function hasRole(user: UserProfile | null, role: UserRole) {
  return Boolean(user && user.role === role);
}

export function isDean(user: UserProfile | null) {
  return hasRole(user, "dean");
}
