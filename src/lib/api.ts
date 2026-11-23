export type Staff = {
  id: string;
  nombre: string;
  apellido: string;
  correo: string;
  roles: string[];
  sucursales: string[];
};

export type Branch = { id: string; nombre: string; direccion: string; telefono: string; tipo: "PRINCIPAL" | "SECUNDARIA" };

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

let csrfToken: string | null = null;

async function csrf() {
  const response = await fetch("/api/v1/auth/csrf", { credentials: "same-origin", cache: "no-store" });
  if (!response.ok) throw new ApiError(response.status, "No se pudo preparar la sesión segura.");
  const data: { token: string } = await response.json();
  csrfToken = data.token;
  return csrfToken;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = init.method?.toUpperCase() ?? "GET";
  const headers = new Headers(init.headers);
  if (method !== "GET" && method !== "HEAD") {
    headers.set("X-XSRF-TOKEN", await csrf());
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  }
  let response: Response;
  try {
    response = await fetch(`/api/v1${path}`, { ...init, headers, credentials: "same-origin", cache: "no-store" });
  } catch {
    throw new ApiError(0, "No se pudo conectar con Amankay. Comprueba que el backend esté iniciado.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new ApiError(response.status, detail?.detail ?? detail?.message ?? `La solicitud falló (${response.status}).`);
  }
  if (response.status === 204 || response.headers.get("content-length") === "0") return undefined as T;
  const text = await response.text();
  return text ? JSON.parse(text) as T : undefined as T;
}

export function login(email: string, password: string) {
  return api<Staff>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function logout() {
  await api<void>("/auth/logout", { method: "POST" });
  csrfToken = null;
}
