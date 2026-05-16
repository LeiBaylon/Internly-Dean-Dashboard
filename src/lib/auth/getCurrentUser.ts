import { cookies } from "next/headers";
import type { UserProfile, UserRole } from "../types";

const DEFAULT_USER: UserProfile = {
  uid: "dean-demo",
  displayName: "Dean Rivera",
  role: "dean",
};

export async function getCurrentUser(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("role")?.value as UserRole | undefined;
  const role = roleCookie === "intern" || roleCookie === "dean"
    ? roleCookie
    : DEFAULT_USER.role;

  return { ...DEFAULT_USER, role };
}
