import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("return_to") || url.searchParams.get("next") || "/";
  const safeReturn =
    returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL(safeReturn, url.origin));
  response.cookies.delete("hatchlink_user_session");

  return response;
}
