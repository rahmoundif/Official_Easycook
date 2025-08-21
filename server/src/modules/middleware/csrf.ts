import type { RequestHandler } from "express";
import crypto from "node:crypto";

const CSRF_COOKIE_NAME = "csrfToken";
const CSRF_HEADER_NAME = "x-csrf-token";

// Generate a cryptographically strong token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// Issue CSRF cookie on safe methods; validate on unsafe methods
export const csrfProtection: RequestHandler = (req, res, next) => {
  const method = req.method.toUpperCase();
  const isSafe = method === "GET" || method === "HEAD" || method === "OPTIONS";
  // Allowlist endpoints that don't need CSRF (no existing authenticated session yet)
  if (!isSafe) {
    const path = req.path.toLowerCase();
    if (path === "/login" || path === "/signup") {
      return next();
    }
  }

  const cookieToken = (req as any).cookies?.[CSRF_COOKIE_NAME] as string | undefined;

  if (isSafe) {
    // Ensure a CSRF token cookie exists so the client can echo it in headers
    if (!cookieToken) {
      const token = generateToken();
      try {
        (res as any).cookie?.(CSRF_COOKIE_NAME, token, {
          httpOnly: false, // must be readable by client to echo in header
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        // Also expose the token in a response header for cross-site clients
        res.setHeader("X-CSRF-Token", token);
      } catch {
        // ignore if cookie helper missing
      }
    } else {
      // Cookie already exists; expose it in header so cross-site clients can read it
      res.setHeader("X-CSRF-Token", cookieToken);
    }
    return next();
  }

  // For state-changing requests, require header match with cookie
  const headerToken = (req.headers[CSRF_HEADER_NAME] as string | undefined) ||
    (req.headers[CSRF_HEADER_NAME.toUpperCase()] as string | undefined);

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    res.status(403).json({ message: "Invalid CSRF token" });
    return;
  }
  return next();
};

export default { csrfProtection };
