"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createDevice, updateDevice } from "@/app/actions/devices";
import { imeiError, normalizeImei } from "@/lib/imei";
import { DEVICE_MAKES } from "@/lib/kenya";
import type { Device } from "@/lib/types";

export function DeviceForm({ device }: { device?: Device }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [imeiHint, setImeiHint] = useState<string | null>(null);

  function checkImei(value: string) {
    const v = normalizeImei(value);
    setImeiHint(v.length > 0 ? imeiError(v) : null);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const result = device
        ? await updateDevice(device.id, formData)
        : await createDevice(formData);
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      router.push(device ? `/devices/${device.id}` : `/devices/${result.id}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {!device && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardHeader>
            <CardTitle className="text-emerald-900">Find your IMEI right now</CardTitle>
            <CardDescription className="text-emerald-800">
              Dial <span className="font-mono text-base font-bold">*#06#</span> on your phone —
              the IMEI appears instantly (two numbers on dual-SIM phones). It&apos;s also on the
              phone box label and your purchase receipt.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="nickname">Nickname *</Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder='e.g. "Work iPhone", "Anne&apos;s Tecno"'
            defaultValue={device?.nickname}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="make">Make *</Label>
          <Select id="make" name="make" defaultValue={device?.make ?? ""} required>
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

        <div className="space-y-2">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            name="model"
            placeholder="e.g. Galaxy A15, Spark 20"
            defaultValue={device?.model}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input id="color" name="color" placeholder="e.g. Black" defaultValue={device?.color ?? ""} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="carrier">Carrier *</Label>
          <Select id="carrier" name="carrier" defaultValue={device?.carrier ?? "safaricom"}>
            <option value="safaricom">Safaricom</option>
            <option value="airtel">Airtel</option>
            <option value="telkom">Telkom</option>
            <option value="multiple">Multiple (dual SIM, different carriers)</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="imei_primary">IMEI 1 *</Label>
          <Input
            id="imei_primary"
            name="imei_primary"
            inputMode="numeric"
            placeholder="15 digits"
            defaultValue={device?.imei_primary}
            onChange={(e) => checkImei(e.target.value)}
            required
          />
          {imeiHint && <p className="text-sm text-red-600">{imeiHint}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="imei_secondary">IMEI 2 (dual SIM)</Label>
          <Input
            id="imei_secondary"
            name="imei_secondary"
            inputMode="numeric"
            placeholder="Optional"
            defaultValue={device?.imei_secondary ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="msisdn">Phone number on this device</Label>
          <Input
            id="msisdn"
            name="msisdn"
            placeholder="+254712345678"
            defaultValue={device?.msisdn ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="serial_number">Serial number</Label>
          <Input
            id="serial_number"
            name="serial_number"
            placeholder="Optional"
            defaultValue={device?.serial_number ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="google_account_email">Google account on this phone</Label>
          <Input
            id="google_account_email"
            name="google_account_email"
            type="email"
            placeholder="For Find My Device sign-out"
            defaultValue={device?.google_account_email ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="icloud_account_email">iCloud account (iPhones)</Label>
          <Input
            id="icloud_account_email"
            name="icloud_account_email"
            type="email"
            placeholder="For Find My iPhone sign-out"
            defaultValue={device?.icloud_account_email ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_date">Purchase date</Label>
          <Input
            id="purchase_date"
            name="purchase_date"
            type="date"
            defaultValue={device?.purchase_date ?? ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="purchase_location">Where you bought it</Label>
          <Input
            id="purchase_location"
            name="purchase_location"
            placeholder="Shop / receipt provenance helps your case"
            defaultValue={device?.purchase_location ?? ""}
          />
        </div>
      </div>

      {error && (
        <CardContent className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </CardContent>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : device ? "Save changes" : "Register device"}
      </Button>
    </form>
  );
}
