import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getIncidents } from "@/lib/data";
import type { IncidentStatus } from "@/lib/types";

export const metadata = { title: "Incidents — Fuego" };

const STATUS_LABELS: Record<IncidentStatus, { label: string; variant: "warning" | "secondary" | "default" | "outline" }> = {
  reporting: { label: "In progress", variant: "warning" },
  filed: { label: "OB filed", variant: "secondary" },
  resolved_recovered: { label: "Recovered", variant: "default" },
  resolved_written_off: { label: "Written off", variant: "outline" },
};

export default async function IncidentsPage() {
  const incidents = await getIncidents();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Incidents</h1>

      {incidents.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground">
            No incidents on record — long may it stay that way. If a phone is ever stolen, hit
            the red button in the header.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {incidents.map((incident) => {
            const status = STATUS_LABELS[incident.status];
            return (
              <Link key={incident.id} href={`/incidents/${incident.id}`} className="block">
                <Card className="transition-colors hover:bg-accent">
                  <CardContent className="flex items-center justify-between gap-4 p-4">
                    <div>
                      <p className="font-medium">
                        {incident.devices.nickname} — {incident.devices.make}{" "}
                        {incident.devices.model}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(incident.occurred_at).toLocaleString("en-KE")} ·{" "}
                        {incident.location_description}
                      </p>
                      {incident.ob_number && (
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          OB: {incident.ob_number}
                        </p>
                      )}
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
