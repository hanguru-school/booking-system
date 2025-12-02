import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "default_secret_key";

export function generateToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}
