import { NextResponse } from "next/server";

import { buildGoogleSettingsUrl, clearOAuthConnection } from "@/lib/google-oauth";

export async function POST() {
  try {
    await clearOAuthConnection();
    return NextResponse.redirect(buildGoogleSettingsUrl("disconnected", "Gmail disconnected"), 303);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(
      buildGoogleSettingsUrl("error", "Could not clear the saved Gmail connection."),
      303,
    );
  }
}
