import Link from "next/link";
import { AlertTriangle, Plus, ShieldAlert, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ensureProfile, getActiveIncidents, getDevices } from "@/lib/data";

export const metadata = { title: "Dashboard — Fuego" };

export default async function DashboardPage() {
  const profile = await ensureProfile();
  const [devices, activeIncidents] = await Promise.all([getDevices(), getActiveIncidents()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Panic button — always first, always huge */}
      <Card className="border-red-300 bg-red-50">
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <ShieldAlert className="h-12 w-12 shrink-0 text-red-600" />
          <div className="flex-1">
            <h2 className="text-xl font-bold text-red-900">Phone just stolen?</h2>
            <p className="text-sm text-red-800">
              Start the 60-minute response now. Works from any borrowed phone.
            </p>
          </div>
          <Link href="/report">
            <Button size="xl" variant="destructive" className="w-full sm:w-auto">
              I&apos;ve been robbed
            </Button>
          </Link>
        </CardContent>
      </Card>

      {!profile.id_number && (
        <Card className="mt-6 border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 p-4 text-sm text-amber-900">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>
              Add your <strong>National ID number</strong> to your profile — police will ask for
              it when you file an OB, and it pre-fills your OB Kit.{" "}
              <Link href="/account" className="font-semibold underline">
                Add it now
              </Link>
            </span>
          </CardContent>
        </Card>
      )}

      {/* Active incidents */}
      {activeIncidents.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Active incidents</h2>
          <div className="space-y-3">
            {activeIncidents.map((incident) => (
              <Link key={incident.id} href={`/incidents/${incident.id}`} className="block">
                <Card className="border-amber-300 transition-colors hover:bg-amber-50">
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">
                        {incident.devices.nickname} — {incident.devices.make}{" "}
                        {incident.devices.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(incident.occurred_at).toLocaleString("en-KE")} ·{" "}
                        {incident.location_description}
                      </p>
                    </div>
                    <Badge variant={incident.status === "reporting" ? "warning" : "secondary"}>
                      {incident.status === "reporting" ? "In progress" : "OB filed"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Devices */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your devices</h2>
          <Link href="/devices/new">
            <Button size="sm" variant="outline">
              <Plus /> Add device
            </Button>
          </Link>
        </div>

        {devices.length === 0 ? (
          <Card>
            <CardHeader>
              <Smartphone className="h-8 w-8 text-emerald-700" />
              <CardTitle>No devices registered yet</CardTitle>
              <CardDescription>
                Register your phone while it&apos;s still in your pocket. Dial{" "}
                <span className="font-mono font-semibold">*#06#</span> to see your IMEI — it
                takes two minutes and it&apos;s the difference between a fast OB filing and a
                lost cause.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/devices/new">
                <Button>Register my first device</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {devices.map((device) => (
              <Link key={device.id} href={`/devices/${device.id}`} className="block">
                <Card className="h-full transition-colors hover:bg-accent">
                  <CardContent className="p-4">
                    <p className="font-medium">{device.nickname}</p>
                    <p className="text-sm text-muted-foreground">
                      {device.make} {device.model}
                      {device.color ? ` · ${device.color}` : ""}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      IMEI {device.imei_primary}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
