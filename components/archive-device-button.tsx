"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { archiveDevice } from "@/app/actions/devices";

export function ArchiveDeviceButton({ deviceId }: { deviceId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      className="text-muted-foreground"
      disabled={pending}
      onClick={() => {
        if (confirm("Archive this device? It will be hidden from your list but past incidents stay intact.")) {
          startTransition(() => archiveDevice(deviceId));
        }
      }}
    >
      {pending ? "Archiving…" : "Archive device"}
    </Button>
  );
}
