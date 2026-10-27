import { NextResponse } from "next/server";
import { createClient } from "../../../lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = url.searchParams.get("next");
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL(safeNext, url.origin));
}
