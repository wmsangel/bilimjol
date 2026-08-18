// Клиент backend API izn.study. Токены хранятся в localStorage.

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const AUTH_KEY = "izn.study:auth:v1";
const CHILD_KEY = "izn.study:childId:v1";

export interface AuthUser {
  id: string;
  email: string;
  locale: string;
  country: string | null;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Child {
  id: string;
  name: string;
  avatarHelperId: string;
  grade: number;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
  }
}

export function loadAuth(): AuthState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}

function saveAuth(auth: AuthState) {
  window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_KEY);
  window.localStorage.removeItem(CHILD_KEY);
}

/** Полностью очищает локальные данные пользователя (при выходе). */
export function clearLocalUserData() {
  if (typeof window === "undefined") return;
  for (const key of [
    AUTH_KEY,
    CHILD_KEY,
    "izn.study:progress:v1",
    "izn.study:stats:v1",
    "izn.study:helper:v1",
  ]) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // no-op
    }
  }
}

export function isLoggedIn(): boolean {
  return loadAuth() !== null;
}

export function loadChildId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CHILD_KEY);
}

export function saveChildId(id: string) {
  window.localStorage.setItem(CHILD_KEY, id);
}

async function tryRefresh(): Promise<boolean> {
  const auth = loadAuth();
  if (!auth) return false;
  const res = await fetch(`${BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: auth.refreshToken }),
  });
  if (!res.ok) {
    clearAuth();
    return false;
  }
  const data = (await res.json()) as {
    accessToken: string;
    refreshToken: string;
  };
  saveAuth({ ...auth, ...data });
  return true;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const auth = loadAuth();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth.accessToken}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (res.status === 401 && retry && auth?.refreshToken) {
    if (await tryRefresh()) return request<T>(path, options, false);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body);
  }
  return (res.status === 204 ? null : await res.json()) as T;
}

// ── Auth ──
export async function register(
  email: string,
  password: string,
  locale: string,
  country?: string,
) {
  const data = await request<AuthState>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, locale, country }),
  });
  saveAuth(data);
  return data;
}

export async function login(email: string, password: string) {
  const data = await request<AuthState>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  saveAuth(data);
  return data;
}

export async function logout() {
  const auth = loadAuth();
  if (auth) {
    await request("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken: auth.refreshToken }),
    }).catch(() => undefined);
  }
  clearLocalUserData();
}

// ── Children ──
export function listChildren() {
  return request<Child[]>("/children", { method: "GET" });
}

export function createChild(name: string, avatarHelperId: string, grade: number) {
  return request<Child>("/children", {
    method: "POST",
    body: JSON.stringify({ name, avatarHelperId, grade }),
  });
}

// ── Progress ──
export interface ServerState {
  progress: Record<string, { correct: boolean }>;
  stats: {
    streakCount: number;
    lastActiveDate: string | null;
    dailyDate: string | null;
    dailySolved: number;
    unlockedHelpers: string[];
    spentStars: number;
  };
  outfit?: Record<string, string>;
  helperId?: string;
}

/** Что заливаем на сервер (герой шлётся как avatarHelperId). */
export type SyncSnapshot = Omit<ServerState, "helperId"> & {
  avatarHelperId?: string;
};

export function getState(childId: string) {
  return request<ServerState>(`/children/${childId}/state`, { method: "GET" });
}

// ── Подписка ──
export interface Entitlement {
  premium: boolean;
  until: string | null;
  plan: string | null;
}

export function getEntitlement() {
  return request<Entitlement>("/billing/entitlement", { method: "GET" });
}

export function checkout(plan = "monthly", provider = "dev") {
  return request<{ premium: boolean; until: string | null; redirectUrl: string | null }>(
    "/billing/checkout",
    { method: "POST", body: JSON.stringify({ plan, provider }) },
  );
}

// ── Админка ──
export interface AdminStats {
  users: number;
  children: number;
  activeSubscriptions: number;
  premiumUsers: number;
}

export interface AdminUser {
  id: string;
  email: string;
  country: string | null;
  role: string;
  createdAt: string;
  children: number;
  premium: boolean;
}

export function getAdminStats() {
  return request<AdminStats>("/admin/stats", { method: "GET" });
}

export function getAdminUsers(limit = 50, offset = 0) {
  return request<AdminUser[]>(`/admin/users?limit=${limit}&offset=${offset}`, {
    method: "GET",
  });
}

export function adminGrantPremium(userId: string, days?: number) {
  return request<{ premium: boolean; until: string }>(
    `/admin/users/${userId}/grant-premium`,
    { method: "POST", body: JSON.stringify(days ? { days } : {}) },
  );
}

export function adminResetPassword(userId: string) {
  return request<{ password: string }>(
    `/admin/users/${userId}/reset-password`,
    { method: "POST", body: JSON.stringify({}) },
  );
}

export function adminDeleteUser(userId: string) {
  return request<{ deleted: boolean }>(`/admin/users/${userId}`, {
    method: "DELETE",
  });
}

export function syncState(childId: string, snapshot: SyncSnapshot) {
  return request<ServerState>(`/children/${childId}/sync`, {
    method: "POST",
    body: JSON.stringify(snapshot),
  });
}
