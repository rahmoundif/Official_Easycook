export function getCsrfTokenFromCookie(name = "csrfToken"): string | null {
  const value = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(name + "="));
  return value ? decodeURIComponent(value.split("=")[1]) : null;
}
