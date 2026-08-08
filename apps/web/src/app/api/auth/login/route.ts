import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET  = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);
const COOKIE_NAME = "sc_admin_token";
const SEVEN_DAYS  = 7 * 24 * 60 * 60; // seconds

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json() as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_HASH  = process.env.ADMIN_PASSWORD_HASH;

    if (!ADMIN_EMAIL || !ADMIN_HASH) {
      console.error("[auth/login] ADMIN_EMAIL or ADMIN_PASSWORD_HASH env var not set.");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration." },
        { status: 500 }
      );
    }

    const emailMatch    = email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
    const passwordMatch = bcrypt.compareSync(password, ADMIN_HASH);

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Sign a JWT — same secret as the Edge middleware so it can verify it
    const token = await new SignJWT({ sub: email, role: "admin" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      path:     "/",
      maxAge:   SEVEN_DAYS,
    });

    return response;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
