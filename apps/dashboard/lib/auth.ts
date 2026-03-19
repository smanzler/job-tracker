import { cookies } from "next/headers";
import crypto from "crypto";

const AUTH_COOKIE_NAME = "job_dashboard_auth";
const AUTH_SECRET = process.env.AUTH_SECRET;

if (!AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is not set");
}

export function generateAuthToken(): string {
  const timestamp = Date.now();
  const hash = crypto
    .createHmac("sha256", AUTH_SECRET!)
    .update(`${timestamp}`)
    .digest("hex");

  return `${timestamp}.${hash}`;
}

export function validateAuthToken(token: string): boolean {
  try {
    if (!AUTH_SECRET) {
      return false;
    }

    const [timestamp, hash] = token.split(".");

    if (!timestamp || !hash) {
      return false;
    }

    const expectedHash = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(timestamp)
      .digest("hex");

    return hash === expectedHash;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  "use server";

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return validateAuthToken(token);
}

export async function requireAuth(): Promise<void> {
  "use server";

  const authenticated = await isAuthenticated();

  if (!authenticated) {
    throw new Error("Unauthorized: Valid authentication cookie required");
  }
}
