import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ObKitDocument } from "@/lib/pdf/ob-kit";
import { ensureProfile, getDevice, getIncident } from "@/lib/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ deviceId: string }> },
) {
  const { deviceId } = await params;
  const profile = await ensureProfile();

  const device = await getDevice(deviceId);
  if (!device) return NextResponse.json({ error: "Device not found" }, { status: 404 });

  const incidentId = req.nextUrl.searchParams.get("incident");
  const incident = incidentId ? await getIncident(incidentId) : null;
  // RLS already scopes both queries to this user; the profile fetch above
  // guarantees we're signed in.

  const buffer = await renderToBuffer(
    ObKitDocument({
      profile,
      device,
      incident: incident && incident.device_id === device.id ? incident : null,
      generatedAt: new Date(),
    }),
  );

  const filename = `ob-kit-${device.make}-${device.model}`.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
    },
  });
}
