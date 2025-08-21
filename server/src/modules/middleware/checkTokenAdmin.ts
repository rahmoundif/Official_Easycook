import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  id: number;
  isAdmin?: boolean;
}

const checkTokenAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const cookieToken = (req as any).cookies?.token as string | undefined;
  const raw = authHeader || cookieToken;
  if (!raw) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  // Accept either raw token or 'Bearer <token>' format
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }
    const { id, isAdmin } = decoded as JWTPayload;
    if (!isAdmin) {
      res.status(403).send({ message: "Forbidden" });
      return;
    }
    req.userId = id;
    next();
  });
};

export default { checkTokenAdmin };
