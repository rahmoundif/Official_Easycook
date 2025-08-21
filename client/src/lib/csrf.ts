let cachedToken: string | null = null;

export function getCsrfTokenFromCookie(name = "csrfToken"): string | null {
  const value = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  const token = value ? decodeURIComponent(value.split("=")[1]) : null;
  if (token) cachedToken = token;
  return token ?? cachedToken;
}

// Capture token from a response header when available (cross-site support)
export function captureCsrfFromResponse(res: Response) {
  const header = res.headers.get("x-csrf-token") || res.headers.get("X-CSRF-Token");
  if (header) {
    cachedToken = header;
  }
}

// Ensure a CSRF token is available; if missing, call the public /session
// endpoint to get it via response header. Returns the token or null.
export async function ensureCsrf(): Promise<string | null> {
  const existing = getCsrfTokenFromCookie();
  if (existing) return existing;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/session`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    captureCsrfFromResponse(res);
  } catch {
    // ignore
  }
  return getCsrfTokenFromCookie();
}
