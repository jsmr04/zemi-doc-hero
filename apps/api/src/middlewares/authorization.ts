import { Request, Response, NextFunction } from "express";
import { validateToken } from "@/helpers/security";

const auth = async (req: Request, res: Response, next: NextFunction) => {
  // Validate token
  const token = req.headers.authorization;

  if (!token) return res.sendStatus(401); // Unauthorized

  const isValid = await validateToken(token);
  if (isValid) {
    next(); // User is authorized
  } else {
    return res.sendStatus(401); // Unauthorized
  }
};

export { auth };