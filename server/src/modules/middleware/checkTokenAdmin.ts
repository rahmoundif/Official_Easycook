import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

interface JWTPayload {
  AdminId: number;
}

const checkTokenAdmin: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const idToDelete = req.query.idToDelete;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized" });
    return;
  }

  // Accept either raw token or 'Bearer <token>' format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).send({ message: "Unauthorized" });
      return;
    }
    const { AdminId } = decoded as JWTPayload;

    req.userId = AdminId;
    next();
  });
};

export default { checkTokenAdmin };
