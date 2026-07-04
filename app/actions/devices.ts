"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ensureProfile, requireUserId } from "@/lib/data";
import { imeiError, normalizeImei } from "@/lib/imei";
import { KE_PHONE_REGEX, type CarrierId } from "@/lib/kenya";

const CARRIER_IDS: CarrierId[] = ["safaricom", "airtel", "telkom", "multiple"];

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: string;
}

function parseDeviceForm(formData: FormData): { error?: string; values?: Record<string, unknown> } {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const color = String(formData.get("color") ?? "").trim();
  const imeiPrimary = normalizeImei(String(formData.get("imei_primary") ?? ""));
  const imeiSecondaryRaw = normalizeImei(String(formData.get("imei_secondary") ?? ""));
  const serialNumber = String(formData.get("serial_number") ?? "").trim();
  const purchaseDate = String(formData.get("purchase_date") ?? "").trim();
  const purchaseLocation = String(formData.get("purchase_location") ?? "").trim();
  const carrier = String(formData.get("carrier") ?? "safaricom") as CarrierId;
  const msisdn = String(formData.get("msisdn") ?? "").trim();
  const googleEmail = String(formData.get("google_account_email") ?? "").trim();
  const icloudEmail = String(formData.get("icloud_account_email") ?? "").trim();

  if (!nickname) return { error: "Give the device a nickname so you can spot it fast." };
  if (!make) return { error: "Make is required." };
  if (!model) return { error: "Model is required." };

  const primaryError = imeiError(imeiPrimary);
  if (primaryError) return { error: `Primary IMEI: ${primaryError}` };

  if (imeiSecondaryRaw) {
    const secondaryError = imeiError(imeiSecondaryRaw);
    if (secondaryError) return { error: `Secondary IMEI: ${secondaryError}` };
  }

  if (!CARRIER_IDS.includes(carrier)) return { error: "Pick a carrier." };
  if (msisdn && !KE_PHONE_REGEX.test(msisdn))
    return { error: "Device phone number must be in +254 format, e.g. +254712345678." };

  return {
    values: {
      nickname,
      make,
      model,
      color: color || null,
      imei_primary: imeiPrimary,
      imei_secondary: imeiSecondaryRaw || null,
      serial_number: serialNumber || null,
      purchase_date: purchaseDate || null,
      purchase_location: purchaseLocation || null,
      carrier,
      msisdn: msisdn || null,
      google_account_email: googleEmail || null,
      icloud_account_email: icloudEmail || null,
    },
  };
}

export async function createDevice(formData: FormData): Promise<ActionResult> {
  const profile = await ensureProfile();
  const parsed = parseDeviceForm(formData);
  if (parsed.error || !parsed.values) return { ok: false, error: parsed.error ?? "Invalid form." };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("devices")
    .insert({ ...parsed.values, user_id: profile.id })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  revalidatePath("/devices");
  revalidatePath("/dashboard");
  return { ok: true, id: data.id as string };
}

export async function updateDevice(deviceId: string, formData: FormData): Promise<ActionResult> {
  await requireUserId();
  const parsed = parseDeviceForm(formData);
  if (parsed.error || !parsed.values) return { ok: false, error: parsed.error ?? "Invalid form." };

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("devices")
    .update(parsed.values)
    .eq("id", deviceId)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Device not found — nothing was saved." };

  revalidatePath("/devices");
  revalidatePath(`/devices/${deviceId}`);
  return { ok: true };
}

export async function archiveDevice(deviceId: string): Promise<void> {
  await requireUserId();
  const supabase = await createServerSupabaseClient();
  await supabase.from("devices").update({ is_active: false }).eq("id", deviceId);
  revalidatePath("/devices");
  revalidatePath("/dashboard");
  redirect("/devices");
}
