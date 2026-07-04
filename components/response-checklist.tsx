"use client";

import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Phone,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  setChecklistItem,
  updateIncidentReferences,
  type ChecklistField,
} from "@/app/actions/incidents";
import {
  carriersForDevice,
  DCI_CYBERCRIME,
  HIGH_RISK_ACCOUNTS,
  KECIRT,
  kecirtEmailTemplate,
  LOSTPHONE_KE,
  MPESA_WARNING,
  NAIROBI_POLICE_STATIONS,
} from "@/lib/kenya";
import type { Device, Incident, Profile } from "@/lib/types";

interface ChecklistProps {
  incident: Incident;
  device: Device;
  profile: Profile;
}

/** One checklist item shell: number, title, body, and a persistent Done toggle. */
function ChecklistItem({
  index,
  title,
  done,
  onToggle,
  skipWarning,
  children,
  pending,
}: {
  index: number;
  title: string;
  done: boolean;
  onToggle?: (value: boolean) => void;
  skipWarning: string;
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <Card className={done ? "border-emerald-300 bg-emerald-50/50" : ""}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-start gap-3">
          <span
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
              done ? "bg-emerald-600" : "bg-red-600"
            }`}
          >
            {done ? <Check className="h-5 w-5" /> : index}
          </span>
          <span className="pt-1">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pl-6 sm:pl-[4.25rem]">
        {children}
        <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            <strong>If you skip this:</strong> {skipWarning}
          </span>
        </div>
        {onToggle && (
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={done}
              disabled={pending}
              onChange={(e) => onToggle(e.target.checked)}
              className="h-5 w-5 accent-emerald-700"
            />
            Mark done
          </label>
        )}
      </CardContent>
    </Card>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? <Check /> : <Copy />} {copied ? "Copied!" : label}
    </Button>
  );
}

export function ResponseChecklist({ incident, device, profile }: ChecklistProps) {
  const [state, setState] = useState(incident);
  const [pending, startTransition] = useTransition();
  const [stationQuery, setStationQuery] = useState("");
  const [obDraft, setObDraft] = useState(incident.ob_number ?? "");
  const [stationDraft, setStationDraft] = useState(incident.police_station ?? "");
  const [kecirtDraft, setKecirtDraft] = useState(incident.kecirt_reference ?? "");
  const [refsSaved, setRefsSaved] = useState(false);

  function toggle(field: ChecklistField, value: boolean) {
    setState((s) => ({ ...s, [field]: value }));
    startTransition(async () => {
      const result = await setChecklistItem(incident.id, field, value);
      if (!result.ok) setState((s) => ({ ...s, [field]: !value })); // revert on failure
    });
  }

  function saveReferences() {
    startTransition(async () => {
      const result = await updateIncidentReferences(incident.id, {
        obNumber: obDraft,
        policeStation: stationDraft,
        kecirtReference: kecirtDraft,
      });
      if (result.ok) {
        setState((s) => ({
          ...s,
          ob_number: obDraft.trim() || null,
          police_station: stationDraft.trim() || null,
          kecirt_reference: kecirtDraft.trim() || null,
        }));
        setRefsSaved(true);
        setTimeout(() => setRefsSaved(false), 2500);
      }
    });
  }

  const carriers = carriersForDevice(device.carrier);
  const isApple = device.make.toLowerCase().includes("apple") || !!device.icloud_account_email;
  const showGoogle = !isApple || !!device.google_account_email;
  const showIcloud = isApple;

  const stations = useMemo(() => {
    const q = stationQuery.trim().toLowerCase();
    if (!q) return NAIROBI_POLICE_STATIONS;
    return NAIROBI_POLICE_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q),
    );
  }, [stationQuery]);

  const kecirtEmail = kecirtEmailTemplate({
    fullName: profile.full_name ?? "(your full name)",
    phone: profile.phone_e164 ?? "(your contact number)",
    idNumber: profile.id_number,
    make: device.make,
    model: device.model,
    imeiPrimary: device.imei_primary,
    imeiSecondary: device.imei_secondary,
    msisdn: device.msisdn,
    occurredAt: new Date(state.occurred_at).toLocaleString("en-KE"),
    locationDescription: state.location_description,
    narrative: state.narrative,
    obNumber: state.ob_number,
    policeStation: state.police_station,
  });

  let step = 0;

  return (
    <div className="space-y-5">
      {/* 1 — SIM + M-PESA */}
      <ChecklistItem
        index={++step}
        title="Lock your SIM and M-PESA immediately"
        done={state.carrier_block_confirmed && state.mpesa_locked}
        skipWarning={MPESA_WARNING}
        pending={pending}
      >
        {carriers.map((carrier) => (
          <div key={carrier.name} className="rounded-md border p-3">
            <p className="font-semibold">{carrier.name}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a href={`tel:${carrier.freeFromNetwork}`}>
                <Button size="sm">
                  <Phone /> Call {carrier.freeFromNetwork} (free from {carrier.name} line)
                </Button>
              </a>
              <a href={`tel:${carrier.fromOtherNetwork.replace(/\s/g, "")}`}>
                <Button size="sm" variant="outline">
                  <Phone /> {carrier.fromOtherNetwork} (any phone)
                </Button>
              </a>
            </div>
            <p className="mt-2 text-sm">{carrier.simBlockScript}</p>
            <div className="mt-2 space-y-1 rounded bg-muted p-2 text-sm">
              <p>
                Your ID number:{" "}
                <span className="font-mono font-bold">{profile.id_number ?? "— add it in Account —"}</span>
              </p>
              <p>
                Stolen line:{" "}
                <span className="font-mono font-bold">{device.msisdn ?? "— not on file —"}</span>
              </p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{carrier.blockPhoneNote}</p>
          </div>
        ))}
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={state.carrier_block_confirmed}
              disabled={pending}
              onChange={(e) => toggle("carrier_block_confirmed", e.target.checked)}
              className="h-5 w-5 accent-emerald-700"
            />
            SIM blocked
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={state.mpesa_locked}
              disabled={pending}
              onChange={(e) => toggle("mpesa_locked", e.target.checked)}
              className="h-5 w-5 accent-emerald-700"
            />
            M-PESA locked
          </label>
        </div>
      </ChecklistItem>

      {/* 2 — Google / iCloud */}
      <ChecklistItem
        index={++step}
        title="Sign out remotely from Google / iCloud"
        done={
          (showGoogle ? state.google_account_signed_out : true) &&
          (showIcloud ? state.icloud_signed_out : true) &&
          (showGoogle || showIcloud)
        }
        skipWarning="Your email is the master key to every other account. A thief inside your Gmail or iCloud can reset your bank passwords and read your one-time PINs."
        pending={pending}
      >
        <p className="text-sm">
          Mark the device as <strong>lost</strong> and sign out. Do <strong>NOT</strong> erase it
          yet — erasing kills the signal. Only erase after 24 hours if it hasn&apos;t been
          recovered.
        </p>
        <div className="flex flex-wrap gap-2">
          {showGoogle && (
            <a href="https://google.com/android/find" target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <ExternalLink /> Google Find My Device
                {device.google_account_email ? ` (${device.google_account_email})` : ""}
              </Button>
            </a>
          )}
          {showIcloud && (
            <a href="https://www.icloud.com/find" target="_blank" rel="noopener noreferrer">
              <Button size="sm">
                <ExternalLink /> iCloud Find My iPhone
                {device.icloud_account_email ? ` (${device.icloud_account_email})` : ""}
              </Button>
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-medium">
          {showGoogle && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={state.google_account_signed_out}
                disabled={pending}
                onChange={(e) => toggle("google_account_signed_out", e.target.checked)}
                className="h-5 w-5 accent-emerald-700"
              />
              Google signed out
            </label>
          )}
          {showIcloud && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={state.icloud_signed_out}
                disabled={pending}
                onChange={(e) => toggle("icloud_signed_out", e.target.checked)}
                className="h-5 w-5 accent-emerald-700"
              />
              iCloud signed out
            </label>
          )}
        </div>
      </ChecklistItem>

      {/* 3 — Police OB */}
      <ChecklistItem
        index={++step}
        title="Go to the nearest police station and get an OB number"
        done={!!state.ob_number}
        skipWarning="Without an OB number, KE-CIRT will not blacklist the IMEI and DCI cannot open a case. Insurance and carrier IMEI-blocking also need it."
        pending={pending}
      >
        <a href={`/api/ob-kit/${device.id}?incident=${incident.id}`}>
          <Button>
            <FileText /> Download OB Kit PDF
          </Button>
        </a>
        <p className="text-sm text-muted-foreground">
          Show the PDF (or this screen) to the desk officer — it has your ID, the device
          details, IMEI, and what happened, ready to copy into the Occurrence Book.
        </p>

        <div className="space-y-2">
          <Label htmlFor="station-search">Find a Nairobi police station</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="station-search"
              className="pl-9"
              placeholder="Search by name or area (e.g. Kilimani, CBD)…"
              value={stationQuery}
              onChange={(e) => setStationQuery(e.target.value)}
            />
          </div>
          <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2 text-sm">
            {stations.map((station) => (
              <button
                key={station.name}
                type="button"
                onClick={() => setStationDraft(station.name)}
                className={`block w-full rounded px-2 py-1.5 text-left hover:bg-accent ${
                  stationDraft === station.name ? "bg-accent font-medium" : ""
                }`}
              >
                <span className="font-medium">{station.name}</span>{" "}
                <span className="text-muted-foreground">
                  — {station.area}, {station.address}
                </span>
              </button>
            ))}
            {stations.length === 0 && (
              <p className="p-2 text-muted-foreground">No match — any station can take the OB.</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="ob-number">OB number (once you have it)</Label>
            <Input
              id="ob-number"
              placeholder="e.g. OB 24/07/04/2026"
              value={obDraft}
              onChange={(e) => setObDraft(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="police-station">Police station</Label>
            <Input
              id="police-station"
              placeholder="e.g. Central Police Station"
              value={stationDraft}
              onChange={(e) => setStationDraft(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" size="sm" variant="outline" onClick={saveReferences} disabled={pending}>
          {refsSaved ? <Check /> : null} {refsSaved ? "Saved" : "Save OB details"}
        </Button>
      </ChecklistItem>

      {/* 4 — KE-CIRT */}
      <ChecklistItem
        index={++step}
        title="Register the IMEI with KE-CIRT"
        done={state.kecirt_reported}
        onToggle={(v) => toggle("kecirt_reported", v)}
        skipWarning="An unblacklisted IMEI means the phone can be resold and reused on Kenyan networks — and you lose the paper trail that proves you acted."
        pending={pending}
      >
        <p className="text-sm">
          Email <a className="font-mono underline" href={`mailto:${KECIRT.email}`}>{KECIRT.email}</a>{" "}
          or call{" "}
          {KECIRT.phones.map((phoneNumber, i) => (
            <span key={phoneNumber}>
              {i > 0 && " / "}
              <a className="underline" href={`tel:${phoneNumber.replace(/-/g, "")}`}>
                {phoneNumber}
              </a>
            </span>
          ))}
          . {KECIRT.note}
        </p>
        <div className="rounded-md border bg-muted p-3">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Subject</p>
          <p className="text-sm">{kecirtEmail.subject}</p>
          <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">Body</p>
          <pre className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs">{kecirtEmail.body}</pre>
        </div>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={kecirtEmail.body} label="Copy email body" />
          <CopyButton text={kecirtEmail.subject} label="Copy subject" />
          <a
            href={`mailto:${KECIRT.email}?subject=${encodeURIComponent(kecirtEmail.subject)}&body=${encodeURIComponent(kecirtEmail.body)}`}
          >
            <Button size="sm">
              <ExternalLink /> Open in email app
            </Button>
          </a>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1">
            <Label htmlFor="kecirt-ref">KE-CIRT reference (when they reply)</Label>
            <Input
              id="kecirt-ref"
              placeholder="Reference number from their response"
              value={kecirtDraft}
              onChange={(e) => setKecirtDraft(e.target.value)}
            />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={saveReferences} disabled={pending}>
            Save
          </Button>
        </div>
      </ChecklistItem>

      {/* 5 — LostPhoneKE */}
      <ChecklistItem
        index={++step}
        title="Register on LostPhoneKE"
        done={state.lostphoneke_registered}
        onToggle={(v) => toggle("lostphoneke_registered", v)}
        skipWarning="LostPhoneKE is checked by second-hand buyers and repair shops. An unlisted phone is easier to resell."
        pending={pending}
      >
        <a href={LOSTPHONE_KE.url} target="_blank" rel="noopener noreferrer">
          <Button size="sm">
            <ExternalLink /> Open LostPhoneKE
          </Button>
        </a>
        <div className="text-sm">
          <p className="font-medium">You&apos;ll need:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
            {LOSTPHONE_KE.fieldsNeeded.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      </ChecklistItem>

      {/* 6 — Passwords */}
      <ChecklistItem
        index={++step}
        title="Change passwords on high-risk accounts"
        done={state.passwords_changed}
        onToggle={(v) => toggle("passwords_changed", v)}
        skipWarning="Saved sessions on the stolen phone stay logged in until you change passwords or force sign-outs. Banking apps and email are the priority."
        pending={pending}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {HIGH_RISK_ACCOUNTS.map((account) => (
            <li key={account.key}>{account.label}</li>
          ))}
        </ul>
      </ChecklistItem>

      {/* Financial loss gate + 7 — DCI */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={state.financial_loss}
              disabled={pending}
              onChange={(e) => toggle("financial_loss", e.target.checked)}
              className="h-5 w-5 accent-red-600"
            />
            Money has already been taken (M-PESA, Fuliza, bank, or loan apps)
          </label>
        </CardContent>
      </Card>

      {state.financial_loss && (
        <ChecklistItem
          index={++step}
          title="Report to DCI Cybercrime — money was taken"
          done={state.dci_reported}
          onToggle={(v) => toggle("dci_reported", v)}
          skipWarning="Fraud recovery through Safaricom or your bank moves much faster with a DCI case number. Report while transactions are fresh."
          pending={pending}
        >
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${DCI_CYBERCRIME.tollFree.replace(/\s/g, "")}`}>
              <Button size="sm" variant="destructive">
                <Phone /> Toll-free {DCI_CYBERCRIME.tollFree}
              </Button>
            </a>
            <a
              href={`https://wa.me/${DCI_CYBERCRIME.whatsapp.replace(/\s/g, "").replace(/^0/, "254")}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="sm" variant="outline">
                <ExternalLink /> WhatsApp {DCI_CYBERCRIME.whatsapp}
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            Have ready: your OB number, the fraudulent transaction messages, and the stolen
            line&apos;s number.
          </p>
        </ChecklistItem>
      )}
    </div>
  );
}
