import Link from "next/link";
import { ShieldAlert, Smartphone, ListChecks, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-emerald-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <p className="mb-3 inline-block rounded-full bg-red-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            Free during beta
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">
            Your phone gets snatched on Tom Mboya Street. The next 60 minutes decide whether you
            lose a phone — or your M-PESA, your bank, and your week.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-emerald-100">
            Fuego keeps your device details ready before anything happens. If your phone is
            stolen, we walk you through blocking your SIM, locking M-PESA, filing the OB, and
            blacklisting the IMEI — step by step, from any borrowed phone.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/sign-up">
              <Button size="xl" className="bg-white text-emerald-900 hover:bg-emerald-50">
                Register my phone now
              </Button>
            </Link>
            <Link href="/how-it-works">
              <Button size="xl" variant="ghost" className="text-white hover:bg-emerald-800 hover:text-white">
                See how it works
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-3xl font-bold">How it works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <Smartphone className="mb-2 h-8 w-8 text-emerald-700" />
              <CardTitle>1. Register your phone today</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Two minutes, while your phone is still in your pocket. Dial *#06# and save your
              IMEI, carrier, and account details into your private vault.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShieldAlert className="mb-2 h-8 w-8 text-red-600" />
              <CardTitle>2. If it&apos;s stolen, hit the panic button</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              From any browser, on any borrowed phone. Tell us what happened in 30 seconds and
              we build your response plan — tailored to Safaricom, Airtel, or Telkom.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ListChecks className="mb-2 h-8 w-8 text-emerald-700" />
              <CardTitle>3. Work the 60-minute checklist</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Block the SIM. Lock M-PESA. Sign out of Google. File the OB with a ready-made PDF.
              Blacklist the IMEI with KE-CIRT. Every number, script, and link in one place.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* The OB Kit */}
      <section className="border-y bg-muted">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 py-16 sm:flex-row sm:items-center">
          <FileText className="h-16 w-16 shrink-0 text-emerald-700" />
          <div>
            <h2 className="text-2xl font-bold">The OB Kit: walk into the station prepared</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Police need your ID number, IMEI, and a clear narrative before they&apos;ll open an
              OB entry. Most people can&apos;t produce an IMEI for a phone they no longer have.
              Fuego generates a one-page PDF with everything the officer needs to copy — so you
              spend minutes at the desk, not hours.
            </p>
          </div>
        </div>
      </section>

      {/* Honest pitch */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold">We won&apos;t promise to get your phone back.</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Only about 23% of stolen phones are ever recovered, and most leave Kenya within hours.
          What you <em>can</em> save is your money, your accounts, and your time — if you move
          fast and in the right order. That&apos;s what Fuego is for.
        </p>
        <div className="mt-8">
          <Link href="/sign-up">
            <Button size="xl">Get protected — free during beta</Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          <Link href="/why" className="underline">
            Read the uncomfortable truths about phone theft in Kenya →
          </Link>
        </p>
      </section>
    </div>
  );
}
