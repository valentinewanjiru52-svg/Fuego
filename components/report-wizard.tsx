"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ResponseChecklist } from "@/components/response-checklist";
import { createDevice } from "@/app/actions/devices";
import { createIncident } from "@/app/actions/incidents";
import { imeiError } from "@/lib/imei";
import { DEVICE_MAKES } from "@/lib/kenya";
import type { Device, Incident, Profile } from "@/lib/types";

const NARRATIVE_PRESETS = [
  "Snatched from my hand",
  "Pickpocketed",
  "Robbed at gunpoint",
  "Grabbed through a matatu window",
];

type Step = "device" | "details" | "checklist" | "done";

function nowLocalDatetime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function ReportWizard({
  profile,
  devices,
  preselectedDeviceId,
}: {
  profile: Profile;
  devices: Device[];
  preselectedDeviceId?: string;
}) {
  const preselected = devices.find((d) => d.id === preselectedDeviceId) ?? null;
  // A device deep-link ("Report this device stolen") skips straight to step 2.
  const [step, setStep] = useState<Step>(preselected ? "details" : "device");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [selectedDevice, setSelectedDevice] = useState<Device | null>(preselected);
  const [showUnregistered, setShowUnregistered] = useState(devices.length === 0);

  // Default "now" is filled in after mount: the value is minute-precise and
  // client-local, so computing it during SSR risks a hydration mismatch.
  const [occurredAt, setOccurredAt] = useState("");
  useEffect(() => {
    setOccurredAt((value) => value || nowLocalDatetime());
  }, []);
  const [location, setLocation] = useState("");
  const [narrative, setNarrative] = useState("");

  const [incident, setIncident] = useState<Incident | null>(null);

  function pickDevice(device: Device) {
    setSelectedDevice(device);
    setStep("details");
  }

  function submitUnregistered(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const imeiProblem = imeiError(String(formData.get("imei_primary") ?? ""));
    if (imeiProblem) {
      setError(imeiProblem);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createDevice(formData);
      if (!result.ok || !result.id) {
        setError(result.error ?? "Could not save the device.");
        return;
      }
      // Build a local device object so we can continue without a refetch.
      setSelectedDevice({
        id: result.id,
        user_id: profile.id,
        nickname: String(formData.get("nickname") || "My stolen phone"),
        make: String(formData.get("make") || "Unknown"),
        model: String(formData.get("model") || ""),
        color: null,
        imei_primary: String(formData.get("imei_primary") || "").replace(/[\s-]/g, ""),
        imei_secondary: null,
        serial_number: null,
        purchase_date: null,
        purchase_location: null,
        carrier: (formData.get("carrier") as Device["carrier"]) || "safaricom",
        msisdn: String(formData.get("msisdn") || "") || null,
        google_account_email: null,
        icloud_account_email: null,
        created_at: new Date().toISOString(),
        is_active: true,
      });
      setStep("details");
    });
  }

  function submitDetails(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedDevice) return;
    setError(null);
    startTransition(async () => {
      const result = await createIncident({
        deviceId: selectedDevice.id,
        occurredAt: new Date(occurredAt).toISOString(),
        locationDescription: location,
        narrative,
      });
      if (!result.ok || !result.id) {
        setError(result.error ?? "Could not create the incident.");
        return;
      }
      setIncident({
        id: result.id,
        user_id: profile.id,
        device_id: selectedDevice.id,
        occurred_at: new Date(occurredAt).toISOString(),
        location_description: location.trim(),
        narrative: narrative.trim(),
        ob_number: null,
        police_station: null,
        kecirt_reference: null,
        kecirt_reported: false,
        carrier_block_confirmed: false,
        mpesa_locked: false,
        google_account_signed_out: false,
        icloud_signed_out: false,
        lostphoneke_registered: false,
        passwords_changed: false,
        financial_loss: false,
        dci_reported: false,
        status: "reporting",
        created_at: new Date().toISOString(),
      });
      setStep("checklist");
      window.scrollTo({ top: 0 });
    });
  }

  /* ------------------------------ Step 1 ------------------------------ */
  if (step === "device") {
    return (
      <div className="space-y-4">
        <p className="text-lg font-medium">Which device was stolen?</p>

        {devices.map((device) => (
          <button key={device.id} type="button" onClick={() => pickDevice(device)} className="block w-full text-left">
            <Card className="transition-colors hover:border-red-400 hover:bg-red-50">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{device.nickname}</p>
                  <p className="text-sm text-muted-foreground">
                    {device.make} {device.model} · IMEI {device.imei_primary}
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </button>
        ))}

        {!showUnregistered ? (
          <button
            type="button"
            onClick={() => setShowUnregistered(true)}
            className="text-sm text-emerald-800 underline"
          >
            It&apos;s a device I never registered
          </button>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Unregistered device</CardTitle>
              <CardDescription>
                We need the IMEI to make the OB and IMEI blacklisting possible. Look on the{" "}
                <strong>phone box label</strong>, your <strong>purchase receipt</strong>, or in
                your Google account: myaccount.google.com → Security → Your devices.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitUnregistered} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="nickname" value="My stolen phone" />
                <div className="space-y-1">
                  <Label htmlFor="uw-make">Make *</Label>
                  <Select id="uw-make" name="make" defaultValue="" required>
                    <option value="" disabled>
                      Select make…
                    </option>
                    {DEVICE_MAKES.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="uw-model">Model *</Label>
                  <Input id="uw-model" name="model" placeholder="e.g. Spark 20" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="uw-imei">IMEI (15 digits) *</Label>
                  <Input id="uw-imei" name="imei_primary" inputMode="numeric" required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="uw-carrier">Carrier *</Label>
                  <Select id="uw-carrier" name="carrier" defaultValue="safaricom">
                    <option value="safaricom">Safaricom</option>
                    <option value="airtel">Airtel</option>
                    <option value="telkom">Telkom</option>
                    <option value="multiple">Multiple / dual SIM</option>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="uw-msisdn">Phone number on the device</Label>
                  <Input id="uw-msisdn" name="msisdn" placeholder="+254712345678" />
                </div>
                {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
                <div className="sm:col-span-2">
                  <Button type="submit" disabled={pending}>
                    {pending ? "Saving…" : "Continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  /* ------------------------------ Step 2 ------------------------------ */
  if (step === "details" && selectedDevice) {
    return (
      <form onSubmit={submitDetails} className="space-y-5">
        <p className="text-lg font-medium">
          What happened to <span className="text-red-700">{selectedDevice.nickname}</span>?
        </p>
        <p className="text-sm text-muted-foreground">
          Thirty seconds. Rough details are fine — you can refine them later.
        </p>

        <div className="space-y-1">
          <Label htmlFor="occurred-at">When?</Label>
          <Input
            id="occurred-at"
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="location">Where?</Label>
          <Input
            id="location"
            placeholder='e.g. "Kenyatta Avenue near Hilton, around 3pm"'
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="narrative">What happened?</Label>
          <div className="flex flex-wrap gap-2">
            {NARRATIVE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNarrative(preset)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  narrative === preset
                    ? "border-red-600 bg-red-50 font-medium text-red-800"
                    : "hover:bg-accent"
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <Textarea
            id="narrative"
            placeholder="Or describe it in 2–3 sentences — this goes into your OB Kit."
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => setStep("device")}>
            Back
          </Button>
          <Button type="submit" variant="destructive" size="lg" disabled={pending}>
            {pending ? "Starting…" : "Start my response plan"}
          </Button>
        </div>
      </form>
    );
  }

  /* ------------------------------ Step 3 ------------------------------ */
  if (step === "checklist" && incident && selectedDevice) {
    return (
      <div className="space-y-6">
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <ShieldAlert className="h-8 w-8 shrink-0 text-red-600" />
            <div>
              <p className="font-bold text-red-900">The clock is running.</p>
              <p className="text-sm text-red-800">
                Work top to bottom — the order matters. Every step saves as you go.
              </p>
            </div>
          </CardContent>
        </Card>

        <ResponseChecklist incident={incident} device={selectedDevice} profile={profile} />

        <div className="text-center">
          <Button size="xl" onClick={() => setStep("done")}>
            I&apos;ve done what I can for now
          </Button>
        </div>
      </div>
    );
  }

  /* ------------------------------ Step 4 ------------------------------ */
  if (step === "done" && incident) {
    return (
      <Card className="mx-auto max-w-xl text-center">
        <CardContent className="space-y-4 p-8">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" />
          <h2 className="text-2xl font-bold">You&apos;ve done what you can in the first hour.</h2>
          <p className="text-muted-foreground">
            Keep this incident open. Add your OB number when you have it — that unlocks the
            KE-CIRT blacklist and any insurance claim. We&apos;ll check in with you in 7 days.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href={`/incidents/${incident.id}`}>
              <Button size="lg" className="w-full sm:w-auto">
                View incident record
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Back to dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
