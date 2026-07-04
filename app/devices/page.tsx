import Link from "next/link";
import { Plus, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDevices } from "@/lib/data";
import { CARRIERS } from "@/lib/kenya";

export const metadata = { title: "My devices — Fuego" };

export default async function DevicesPage() {
  const devices = await getDevices(true);
  const active = devices.filter((d) => d.is_active);
  const archived = devices.filter((d) => !d.is_active);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My devices</h1>
        <Link href="/devices/new">
          <Button>
            <Plus /> Add device
          </Button>
        </Link>
      </div>

      {active.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <Smartphone className="h-10 w-10 text-emerald-700" />
            <p className="font-medium">No devices registered.</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Register your phone now, while it&apos;s still in your hand. Dial{" "}
              <span className="font-mono font-semibold">*#06#</span> for the IMEI.
            </p>
            <Link href="/devices/new">
              <Button>Register a device</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {active.map((device) => (
          <Link key={device.id} href={`/devices/${device.id}`} className="block">
            <Card className="transition-colors hover:bg-accent">
              <CardContent className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-medium">{device.nickname}</p>
                  <p className="text-sm text-muted-foreground">
                    {device.make} {device.model}
                    {device.color ? ` · ${device.color}` : ""} ·{" "}
                    {device.carrier === "multiple"
                      ? "Dual SIM"
                      : CARRIERS[device.carrier].name}
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    IMEI {device.imei_primary}
                    {device.imei_secondary ? ` / ${device.imei_secondary}` : ""}
                  </p>
                </div>
                <Badge variant="secondary">Protected</Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {archived.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase text-muted-foreground">
            Archived
          </h2>
          <div className="space-y-3 opacity-60">
            {archived.map((device) => (
              <Card key={device.id}>
                <CardContent className="p-4">
                  <p className="font-medium">{device.nickname}</p>
                  <p className="text-sm text-muted-foreground">
                    {device.make} {device.model} · IMEI {device.imei_primary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
