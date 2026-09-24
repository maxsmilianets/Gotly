import { UserRole } from "@/types";


export type AppUser = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  position?: string;
};


const SESSION_KEY = "gotly_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

function safeRead<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function createSession(user: Omit<AppUser, "password">) {
  safeWrite(SESSION_KEY, user);
}

export function clearSession() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem("accessToken");
  window.localStorage.removeItem("refreshToken");
}

export function getCurrentUser(): Omit<AppUser, "password"> | null {
  return safeRead<Omit<AppUser, "password"> | null>(SESSION_KEY, null);
}

export function isAuthenticated() {
  if (!canUseStorage()) return false;
  return Boolean(window.localStorage.getItem("accessToken") && getCurrentUser());
}

export function getRoleLabel(role: UserRole, position?: string) {
  if (role === "manager") {
    return position?.trim() || "Project Manager";
  }

  return "Członek zespołu";
}

export function getDisplayName(user: Pick<AppUser, "firstName" | "lastName" | "email">) {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fullName || user.email;
}

export function normalizeUserFromApi(data: {
  first_name?: string;
  last_name?: string;
  email?: string;
  role?: UserRole;
  username?: string;
  position?: string;
}) {
  return {
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    email: data.email ?? data.username ?? "",
    role: data.role ?? "member",
    position: data.position ?? "",
  } satisfies Omit<AppUser, "password">;
}
