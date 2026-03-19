import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { generateAuthToken } from "@/lib/auth";

const AUTH_COOKIE_NAME = "job_dashboard_auth";
const AUTH_SECRET = process.env.AUTH_SECRET;

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();

    if (!secret || secret !== AUTH_SECRET) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const token = generateAuthToken();

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Authenticated" });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(AUTH_COOKIE_NAME);

    return NextResponse.json({ success: true, message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
