import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Device, Incident, IncidentWithDevice, Profile } from "@/lib/types";

export async function requireUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");
  return userId;
}

/**
 * Make sure a profile row exists for the signed-in Clerk user, seeding it
 * from Clerk data on first visit. Returns the profile.
 */
export async function ensureProfile(): Promise<Profile> {
  const userId = await requireUserId();
  const supabase = await createServerSupabaseClient();

  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (existing) return existing as Profile;

  const user = await currentUser();
  const insert = {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    phone_e164: user?.primaryPhoneNumber?.phoneNumber ?? null,
    full_name: user?.fullName ?? null,
  };
  const { data, error } = await supabase
    .from("users")
    .upsert(insert)
    .select()
    .single();
  if (error) throw new Error(`Failed to create profile: ${error.message}`);
  return data as Profile;
}

export async function getProfile(): Promise<Profile | null> {
  const userId = await requireUserId();
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return (data as Profile) ?? null;
}

export async function getDevices(includeArchived = false): Promise<Device[]> {
  const supabase = await createServerSupabaseClient();
  let query = supabase.from("devices").select("*").order("created_at", { ascending: false });
  if (!includeArchived) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) throw new Error(`Failed to load devices: ${error.message}`);
  return (data as Device[]) ?? [];
}

export async function getDevice(id: string): Promise<Device | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("devices").select("*").eq("id", id).maybeSingle();
  return (data as Device) ?? null;
}

export async function getIncidents(): Promise<IncidentWithDevice[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*, devices(*)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load incidents: ${error.message}`);
  return (data as IncidentWithDevice[]) ?? [];
}

export async function getIncident(id: string): Promise<IncidentWithDevice | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("incidents")
    .select("*, devices(*)")
    .eq("id", id)
    .maybeSingle();
  return (data as IncidentWithDevice) ?? null;
}

export async function getActiveIncidents(): Promise<IncidentWithDevice[]> {
  const incidents = await getIncidents();
  return incidents.filter((i) => i.status === "reporting" || i.status === "filed");
}

export type { Device, Incident, IncidentWithDevice, Profile };
