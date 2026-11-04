import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const isSupabaseConfigured = Boolean(
    url && key && !url.includes("placeholder.supabase.co")
  );

  if (!isSupabaseConfigured) {
    return {
      auth: {
        async getUser() {
          const sessionCookie = cookieStore.get("hatchlink_user_session")?.value;
          if (sessionCookie) {
            try {
              const parsed = JSON.parse(sessionCookie);
              if (parsed?.email) {
                return {
                  data: {
                    user: {
                      id: `local-${parsed.email}`,
                      email: parsed.email.toLowerCase(),
                      user_metadata: {
                        full_name: parsed.name || parsed.email,
                        name: parsed.name || parsed.email,
                      },
                    },
                  },
                  error: null,
                };
              }
            } catch {
              // Ignore cookie parse error
            }
          }
          return { data: { user: null }, error: null };
        },
        async exchangeCodeForSession(_code: string) {
          return { data: null, error: new Error("Supabase is not configured") };
        },
        async signOut() {
          cookieStore.delete("hatchlink_user_session");
          return { error: null };
        },
      },
    } as any;
  }

  return createServerClient(url!, key!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components cannot write cookies.
        }
      },
    },
  });
}
