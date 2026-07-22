import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "diettrack-secret-key-123456789-default"
);

export async function signAdminToken() {
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(token: string) {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.role === "admin";
  } catch {
    return false;
  }
}
