# Going live — the 15-minute setup

Three free accounts are needed to run Fuego. These must be created by a human
(email verification + terms of service), and they should be owned by **you** —
they hold your users' data and your deployment.

## 1. Clerk (authentication) — ~5 min

1. Go to <https://dashboard.clerk.com> and sign up (use your work email).
2. **Create application** → name it `Fuego`.
   - Sign-in options: enable **Email** and **Phone number**.
3. In the application dashboard → **API keys**:
   - Copy `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (starts `pk_test_`).
   - Copy `CLERK_SECRET_KEY` (starts `sk_test_`).
4. **Configure → Sessions → Customize session token**: no change needed yet;
   the Supabase integration below is done from the Supabase side.

## 2. Supabase (database) — ~5 min

1. Go to <https://supabase.com> and sign up.
2. **New project** → name `fuego`, region **eu-west** (closest to Kenya with
   full feature support), generate a strong database password and store it.
3. **SQL Editor → New query**: paste the entire contents of
   `supabase/migrations/0001_init.sql` and click **Run**. You should see
   "Success. No rows returned".
4. **Authentication → Sign In / Providers → Third Party Auth → Add provider →
   Clerk**: paste your Clerk domain (shown in Clerk under
   **Configure → API keys → Frontend API URL**, e.g.
   `https://xxx.clerk.accounts.dev`). This is what lets Row Level Security
   trust Clerk's user ids.
5. **Project Settings → API**:
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`.
   - Copy the `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

> In Clerk, also open **Integrations → Supabase** (or Configure → Integrations)
> and activate the Supabase integration for this application — it adds the
> `"role": "authenticated"` claim Supabase expects in session tokens.

## 3. Run locally — ~2 min

```bash
cp .env.example .env.local     # then paste in the four values from above
pnpm install
pnpm dev
```

Sign up at http://localhost:3000/sign-up, register a device, and run a test
report end to end (use IMEI `490154203237518` — it passes the checksum).

## 4. Vercel (hosting) — ~3 min

1. Go to <https://vercel.com> and sign up **with your GitHub account**
   (the one that can see this repository).
2. **Add New → Project** → import `valentinewanjiru52-svg/Fuego`.
3. Framework preset: Next.js (auto-detected). Before deploying, open
   **Environment Variables** and add the same four keys from `.env.local`.
4. **Deploy**. When you have a real domain later, add it in Clerk under
   **Configure → Domains** so auth works on production URLs.

## Costs

Everything above is free-tier: Clerk (10k monthly active users), Supabase
(500 MB database), Vercel (hobby). No card required to launch the beta.
