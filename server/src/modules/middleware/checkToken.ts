import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Define the shape of your JWT payload
interface JWTPayload {
  id: number;
}

const checkToken: RequestHandler = (req, res, next) => {
  // Read token from Authorization header or HTTP-only cookie
  const authHeader = req.headers.authorization;
  const cookieToken = (req as any).cookies?.token as string | undefined;

  // Accept either source, prefer header for backward-compat during migration
  const raw = authHeader || cookieToken;
  if (!raw) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  // Accept either raw token or 'Bearer <token>' format
  const token = raw.startsWith("Bearer ") ? raw.slice(7) : raw;

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      // console.error("Token verification failed:", err);
      res.status(401).send({ message: "Unauthorized" });
      return;
    }

  // On extrait l'ID utilisateur (decoded.id) et on le stocke dans la requête (req.userId) pour un usage ultérieur
  const { id } = decoded as JWTPayload;
    req.userId = id;
    next();
  });
};

export default { checkToken };
