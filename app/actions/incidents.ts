"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile, requireUserId } from "@/lib/data";
import type { IncidentStatus } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

export async function createIncident(input: {
  deviceId: string;
  occurredAt: string; // ISO datetime
  locationDescription: string;
  narrative: string;
}): Promise<ActionResult> {
  const profile = await ensureProfile();

  if (!input.deviceId) return { ok: false, error: "Pick a device." };
  if (!input.locationDescription.trim())
    return { ok: false, error: "Where did it happen? Even a rough description helps the OB." };
  if (!input.narrative.trim())
    return { ok: false, error: "Describe what happened in a sentence or two." };
  const occurredAt = new Date(input.occurredAt);
  if (isNaN(occurredAt.getTime())) return { ok: false, error: "Invalid date/time." };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .insert({
      user_id: profile.id,
      device_id: input.deviceId,
      occurred_at: occurredAt.toISOString(),
      location_description: input.locationDescription.trim(),
      narrative: input.narrative.trim(),
      status: "reporting",
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/incidents");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id as string };
}

/** Checklist booleans the wizard and incident page may toggle. */
const CHECKLIST_FIELDS = [
  "kecirt_reported",
  "carrier_block_confirmed",
  "mpesa_locked",
  "google_account_signed_out",
  "icloud_signed_out",
  "lostphoneke_registered",
  "passwords_changed",
  "financial_loss",
  "dci_reported",
] as const;
export type ChecklistField = (typeof CHECKLIST_FIELDS)[number];

export async function setChecklistItem(
  incidentId: string,
  field: ChecklistField,
  value: boolean,
): Promise<ActionResult> {
  await requireUserId();
  if (!CHECKLIST_FIELDS.includes(field)) return { ok: false, error: "Unknown checklist item." };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .update({ [field]: value })
    .eq("id", incidentId)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Incident not found — nothing was saved." };

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  return { ok: true };
}

export async function updateIncidentReferences(
  incidentId: string,
  input: { obNumber?: string; policeStation?: string; kecirtReference?: string },
): Promise<ActionResult> {
  await requireUserId();
  const update: Record<string, string | null> = {};
  if (input.obNumber !== undefined) update.ob_number = input.obNumber.trim() || null;
  if (input.policeStation !== undefined) update.police_station = input.policeStation.trim() || null;
  if (input.kecirtReference !== undefined)
    update.kecirt_reference = input.kecirtReference.trim() || null;
  if (Object.keys(update).length === 0) return { ok: true };

  const supabase = await createServerSupabaseClient();

  // Getting an OB number moves the incident from "reporting" to "filed";
  // clearing it moves a filed incident back so the badges never lie.
  if ("ob_number" in update) {
    const { data } = await supabase
      .from("incidents")
      .select("status")
      .eq("id", incidentId)
      .maybeSingle();
    if (update.ob_number && data?.status === "reporting") update.status = "filed";
    if (!update.ob_number && data?.status === "filed") update.status = "reporting";
  }

  const { data, error } = await supabase
    .from("incidents")
    .update(update)
    .eq("id", incidentId)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Incident not found — nothing was saved." };

  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  return { ok: true };
}

export async function setIncidentStatus(
  incidentId: string,
  status: IncidentStatus,
): Promise<ActionResult> {
  await requireUserId();
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .update({ status })
    .eq("id", incidentId)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Incident not found — nothing was saved." };
  revalidatePath(`/incidents/${incidentId}`);
  revalidatePath("/incidents");
  revalidatePath("/dashboard");
  return { ok: true };
}
