import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildGoogleSettingsUrl, exchangeCodeForConnection } from "@/lib/google-oauth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const googleError = url.searchParams.get("error");
  const cookieStore = await cookies();
  const expectedState = cookieStore.get("google_oauth_state")?.value;

  if (googleError) {
    const response = NextResponse.redirect(
      buildGoogleSettingsUrl("error", `Google OAuth returned: ${googleError}`),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  if (!code || !state || !expectedState || state !== expectedState) {
    const response = NextResponse.redirect(
      buildGoogleSettingsUrl("error", "OAuth callback could not be verified. Please try again."),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }

  try {
    const connection = await exchangeCodeForConnection(code);
    const response = NextResponse.redirect(
      buildGoogleSettingsUrl("connected", `Connected ${connection.email}`),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  } catch (error) {
    console.error(error);
    const response = NextResponse.redirect(
      buildGoogleSettingsUrl(
        "error",
        "Google connection failed while exchanging the authorization code.",
      ),
    );
    response.cookies.delete("google_oauth_state");
    return response;
  }
}
