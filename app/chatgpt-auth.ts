import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "../lib/supabase/server";

export type ChatGPTUser = {
  displayName: string;
  email: string;
  fullName: string | null;
};

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email;

  if (error || !email) return null;

  const user = data.user;
  const fullName =
    user.user_metadata?.full_name ?? user.user_metadata?.name ?? null;

  return {
    email: email.toLowerCase(),
    displayName: fullName || email,
    fullName,
  };
}

export async function requireChatGPTUser(
  returnTo: string,
): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();

  if (user) return user;

  redirect(`/login?next=${encodeURIComponent(safePath(returnTo))}`);
}

export function chatGPTSignInPath(returnTo: string): string {
  return `/login?next=${encodeURIComponent(safePath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = "/"): string {
  return `/auth/signout?next=${encodeURIComponent(safePath(returnTo))}`;
}

function safePath(value: string): string {
  if (!value.startsWith("/") || value.startsWith("//")) return "/";

  try {
    const url = new URL(value, "https://hatchlink.invalid");
    if (url.origin !== "https://hatchlink.invalid") return "/";
    if (url.pathname.startsWith("/auth/")) return "/";
    if (url.pathname === "/login") return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
