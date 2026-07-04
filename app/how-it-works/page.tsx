import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "How it works — Fuego" };

const STEPS = [
  {
    title: "Before anything happens: build your vault",
    body: "Sign up with your email and Kenyan phone number. Add each phone you own: nickname, make, model, IMEI (dial *#06# to see it), carrier, and the Google or iCloud account signed in on it. Add your National ID number to your profile — police will ask for it when you file the OB. All of this sits encrypted in your private vault; only you can see it.",
  },
  {
    title: "Minute 0: the panic button",
    body: "Phone snatched? Borrow any phone or use a cyber café, sign in, and hit “I've been robbed”. Pick the device, tell us when and where in one or two sentences. That's all we need — under 60 seconds.",
  },
  {
    title: "Minutes 1–10: kill the SIM and lock M-PESA",
    body: "The thief's first move is your SIM: with it they can receive M-PESA and bank verification codes. We show you the exact number to call for your carrier — 100 from another Safaricom line, or +254 722 002 100 from any phone — plus the exact words to say and your details ready to read out.",
  },
  {
    title: "Minutes 10–20: cut off your accounts",
    body: "One tap to Google Find My Device or iCloud to mark the phone lost and sign out remotely. We tell you why you should NOT erase it yet. Then a password checklist for the accounts that matter in Kenya: email, KCB, Equity, Absa, Co-op, NCBA, WhatsApp.",
  },
  {
    title: "Minutes 20–60: the OB number",
    body: "Download your OB Kit — a one-page PDF with your ID, device details, IMEI, and incident narrative formatted for the officer to copy. We list major Nairobi police stations so you can head to the nearest one. Without an OB number, KE-CIRT won't blacklist the IMEI and DCI can't open a case.",
  },
  {
    title: "After the first hour: make the theft expensive",
    body: "Copy our pre-filled email to incidents@ke-cirt.go.ke to blacklist the IMEI nationwide. Register on LostPhoneKE. If any money moved, report to DCI Cybercrime (0800 722 203). Your incident record keeps track of every step you completed and when — useful for insurance and follow-ups.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-4xl font-bold">How Fuego works</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Fuego is not a tracking app. It is a response plan: the right actions, in the right
        order, with every phone number and form pre-filled — for the hour when you can&apos;t
        think straight.
      </p>

      <div className="mt-10 space-y-6">
        {STEPS.map((step, i) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-sm text-white">
                  {i + 1}
                </span>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">{step.body}</CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link href="/sign-up">
          <Button size="xl">Set up my vault — free during beta</Button>
        </Link>
      </div>
    </div>
  );
}
