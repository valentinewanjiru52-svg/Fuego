import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Pencil, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchiveDeviceButton } from "@/components/archive-device-button";
import { getDevice } from "@/lib/data";
import { CARRIERS } from "@/lib/kenya";

export const metadata = { title: "Device — Fuego" };

function Field({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono font-medium" : "font-medium"}>{value}</dd>
    </div>
  );
}

export default async function DeviceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const device = await getDevice(id);
  if (!device) notFound();

  const carrierName =
    device.carrier === "multiple" ? "Multiple (dual SIM)" : CARRIERS[device.carrier].name;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{device.nickname}</h1>
          <p className="text-muted-foreground">
            {device.make} {device.model}
            {device.color ? ` · ${device.color}` : ""}
          </p>
        </div>
        <Link href={`/devices/${device.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil /> Edit
          </Button>
        </Link>
      </div>

      {/* Primary actions */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <Link href={`/report?device=${device.id}`} className="block">
          <Button variant="destructive" size="xl" className="w-full">
            <ShieldAlert /> Report this device stolen
          </Button>
        </Link>
        <a href={`/api/ob-kit/${device.id}`} className="block">
          <Button variant="outline" size="xl" className="w-full">
            <FileText /> Download OB Kit (PDF)
          </Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stored details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <Field label="IMEI 1" value={device.imei_primary} mono />
            <Field label="IMEI 2 (dual SIM)" value={device.imei_secondary} mono />
            <Field label="Serial number" value={device.serial_number} mono />
            <Field label="Carrier" value={carrierName} />
            <Field label="Phone number" value={device.msisdn} />
            <Field label="Google account" value={device.google_account_email} />
            <Field label="iCloud account" value={device.icloud_account_email} />
            <Field label="Purchase date" value={device.purchase_date} />
            <Field label="Purchased from" value={device.purchase_location} />
          </dl>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-muted-foreground">
        The OB Kit PDF contains everything above plus your profile details, formatted for a desk
        officer to copy into the Occurrence Book.
      </p>

      <div className="mt-8 border-t pt-4">
        <ArchiveDeviceButton deviceId={device.id} />
      </div>
    </div>
  );
}
