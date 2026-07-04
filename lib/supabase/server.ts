import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client authenticated with the current Clerk session
 * token. Supabase is configured with Clerk as a third-party auth provider,
 * so RLS policies can rely on auth.jwt()->>'sub' being the Clerk user id.
 *
 * Always create per-request (never at module scope): the token is
 * request-specific and env vars are unavailable at build time.
 */
export async function createServerSupabaseClient() {
  const { getToken } = await auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false },
      accessToken: async () => (await getToken()) ?? null,
    },
  );
}
