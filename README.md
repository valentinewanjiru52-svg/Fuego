# Fuego — Phone Theft Response for Kenya

Fuego helps Kenyans respond to phone theft in the critical first 60 minutes. The stolen
device is almost never recoverable — the real product is protecting the person's money
(M-PESA, mobile banking), identity, and time.

Users pre-register their devices in a personal vault. When theft occurs, the app walks
them through a coordinated, carrier-specific response plan:

1. **Block the SIM and lock M-PESA** — carrier-specific numbers and word-for-word scripts
   (Safaricom, Airtel, Telkom), with the user's ID number and stolen line pre-filled.
2. **Sign out remotely from Google / iCloud** — mark lost, don't erase yet.
3. **File the police OB** — a downloadable one-page **OB Kit PDF** with everything the desk
   officer needs to copy, plus a searchable seed list of major Nairobi police stations.
4. **Blacklist the IMEI with KE-CIRT** — pre-filled copyable email template.
5. **Register on LostPhoneKE.**
6. **Change passwords on high-risk accounts** (Kenyan banks, email, WhatsApp).
7. **Report to DCI Cybercrime** — surfaced only if money was actually taken.

Every checklist step persists to the incident record, so the user can later prove exactly
what they did and when.

This is **not** a tracking app. No GPS, no SIM-swap detection, no carrier API integrations —
everything is client-driven: we guide the user to make the calls, fill the forms, and open
the portals themselves.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui-style components
- Clerk (email + phone sign-up, +254 format)
- Supabase Postgres with Row Level Security (Clerk as third-party auth provider)
- `@react-pdf/renderer` for the OB Kit PDF
- Deploys to Vercel · pnpm

## Setup

1. `pnpm install`
2. Create a [Clerk](https://dashboard.clerk.com) app (email + phone number sign-up).
3. Create a [Supabase](https://supabase.com) project and run
   `supabase/migrations/0001_init.sql` in the SQL editor.
4. In Supabase → Authentication → Sign In / Up → Third Party Auth, add **Clerk** so
   Clerk session tokens are accepted and RLS policies can read `auth.jwt()->>'sub'`.
5. Copy `.env.example` to `.env.local` and fill in the keys.
6. `pnpm dev`

## Project map

| Path | What it is |
| --- | --- |
| `app/report` | The critical flow: multi-step theft-response wizard |
| `components/response-checklist.tsx` | The 60-minute checklist (shared with incident detail) |
| `lib/kenya.ts` | All Kenya-specific constants: carriers, police stations, KE-CIRT, DCI, banks |
| `lib/imei.ts` | IMEI Luhn-checksum validation |
| `lib/pdf/ob-kit.tsx` + `app/api/ob-kit/[deviceId]` | OB Kit PDF generation |
| `supabase/migrations/0001_init.sql` | Schema + RLS policies |
