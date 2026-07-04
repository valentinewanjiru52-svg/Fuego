"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { setIncidentStatus } from "@/app/actions/incidents";
import type { IncidentStatus } from "@/lib/types";

export function IncidentStatusControls({
  incidentId,
  status,
}: {
  incidentId: string;
  status: IncidentStatus;
}) {
  const [current, setCurrent] = useState(status);
  const [pending, startTransition] = useTransition();

  function update(next: IncidentStatus) {
    setCurrent(next);
    startTransition(async () => {
      const result = await setIncidentStatus(incidentId, next);
      if (!result.ok) setCurrent(status);
    });
  }

  const isResolved = current === "resolved_recovered" || current === "resolved_written_off";

  return (
    <div className="flex flex-wrap gap-2">
      {!isResolved ? (
        <>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => update("resolved_recovered")}>
            Phone recovered 🎉
          </Button>
          <Button size="sm" variant="ghost" className="text-muted-foreground" disabled={pending} onClick={() => update("resolved_written_off")}>
            Close as written off
          </Button>
        </>
      ) : (
        <Button size="sm" variant="ghost" disabled={pending} onClick={() => update(current === "resolved_recovered" ? "filed" : "reporting")}>
          Reopen incident
        </Button>
      )}
    </div>
  );
}
