import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { IncidentStatusControls } from "@/components/incident-status-controls";
import { ResponseChecklist } from "@/components/response-checklist";
import { ensureProfile, getIncident } from "@/lib/data";
import type { IncidentStatus } from "@/lib/types";

export const metadata = { title: "Incident — Fuego" };

const STATUS_LABELS: Record<IncidentStatus, { label: string; variant: "warning" | "secondary" | "default" | "outline" }> = {
  reporting: { label: "In progress", variant: "warning" },
  filed: { label: "OB filed", variant: "secondary" },
  resolved_recovered: { label: "Recovered", variant: "default" },
  resolved_written_off: { label: "Written off", variant: "outline" },
};

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [profile, incident] = await Promise.all([ensureProfile(), getIncident(id)]);
  if (!incident) notFound();

  const status = STATUS_LABELS[incident.status];
  const { devices: device, ...incidentRow } = incident;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            {device.nickname} — {device.make} {device.model}
          </h1>
          <p className="text-muted-foreground">
            Stolen {new Date(incident.occurred_at).toLocaleString("en-KE")} ·{" "}
            {incident.location_description}
          </p>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="space-y-2 p-4 text-sm">
          <p>
            <span className="text-muted-foreground">What happened: </span>
            {incident.narrative}
          </p>
          {incident.ob_number && (
            <p>
              <span className="text-muted-foreground">OB number: </span>
              <span className="font-mono font-medium">{incident.ob_number}</span>
              {incident.police_station && ` — ${incident.police_station}`}
            </p>
          )}
          {incident.kecirt_reference && (
            <p>
              <span className="text-muted-foreground">KE-CIRT reference: </span>
              <span className="font-mono font-medium">{incident.kecirt_reference}</span>
            </p>
          )}
          <div className="pt-2">
            <IncidentStatusControls incidentId={incident.id} status={incident.status} />
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Response checklist</h2>
      <ResponseChecklist incident={incidentRow} device={device} profile={profile} />
    </div>
  );
}
