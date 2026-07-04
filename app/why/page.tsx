import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Why this matters — Fuego" };

export default function WhyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">The uncomfortable truths</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        We&apos;d rather tell you how this really works than sell you false hope.
      </p>

      <div className="prose mt-10 max-w-none space-y-8">
        <section>
          <h2 className="text-2xl font-semibold">Your phone is probably gone.</h2>
          <p className="mt-2 text-muted-foreground">
            Recovery rates for stolen phones in Kenya hover around 23%. Most stolen phones are
            switched off within minutes, stripped of their SIM, and either flashed for resale or
            moved across the border within hours. Tracking apps rarely change that outcome —
            by the time you&apos;re looking at a dot on a map, the phone is in a matatu to
            somewhere you shouldn&apos;t follow it.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The phone was never the real prize.</h2>
          <p className="mt-2 text-muted-foreground">
            A KES 30,000 phone with an unlocked SIM is a doorway to much more: M-PESA balances,
            Fuliza limits, mobile banking apps, and one-time PINs sent by SMS. SIM-swap and
            stolen-phone fraud has drained individual Kenyans of KES 450,000 and more. The
            financial damage routinely exceeds the value of the handset — and unlike the
            handset, it&apos;s preventable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The first hour matters more than the first week.</h2>
          <p className="mt-2 text-muted-foreground">
            Blocking your SIM takes ten minutes and stops the M-PESA attack cold. Signing out of
            Google or iCloud cuts access to your email — the master key to every account you
            own. Both of these only help if they happen before the thief works through your
            phone. That&apos;s why Fuego is built around the first 60 minutes, not around maps.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">The system only moves if you push it correctly.</h2>
          <p className="mt-2 text-muted-foreground">
            No OB number, no progress: KE-CIRT won&apos;t blacklist an IMEI and DCI won&apos;t
            open a case without one. Most people show up at the station without the IMEI —
            which is on the box they threw away or in settings on the phone they no longer
            have. Registering the IMEI with us today is what makes the OB, the blacklist, and
            any insurance claim possible later.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">What we will do.</h2>
          <p className="mt-2 text-muted-foreground">
            Keep your device details safe and ready. Give you the exact numbers, scripts, links,
            and paperwork in the right order when it happens. Track what you&apos;ve done so you
            can prove it. That&apos;s a smaller promise than “find my phone” — and unlike that
            promise, we can keep it.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link href="/sign-up">
          <Button size="xl">Prepare now — it takes 2 minutes</Button>
        </Link>
      </div>
    </div>
  );
}
