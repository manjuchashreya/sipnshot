import crypto from "node:crypto";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getGoogleAuthUrl } from "@/lib/google-oauth";

export async function GET() {
  try {
    const state = crypto.randomBytes(24).toString("hex");
    await cookies();
    const response = NextResponse.redirect(getGoogleAuthUrl(state));

    response.cookies.set("google_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL("/settings?gmail=error&message=Google%20OAuth%20is%20not%20configured", process.env.APP_URL || "http://localhost:3000"));
  }
}
