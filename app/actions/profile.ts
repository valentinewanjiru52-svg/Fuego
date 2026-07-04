"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { requireUserId } from "@/lib/data";
import { KE_PHONE_REGEX } from "@/lib/kenya";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const userId = await requireUserId();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone_e164") ?? "").trim();
  const idNumber = String(formData.get("id_number") ?? "").trim();

  if (!fullName) return { ok: false, error: "Full name is required — police need it for the OB." };
  if (phone && !KE_PHONE_REGEX.test(phone))
    return { ok: false, error: "Phone must be in Kenyan +254 format, e.g. +254712345678." };
  if (idNumber && !/^\d{6,10}$/.test(idNumber))
    return { ok: false, error: "National ID number should be 6–10 digits." };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("users")
    .update({
      full_name: fullName,
      phone_e164: phone || null,
      id_number: idNumber || null,
    })
    .eq("id", userId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/account");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteAccount(): Promise<ActionResult> {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Remove all app data first (devices/incidents cascade from users). If this
  // fails we must NOT delete the Clerk account, or the orphaned rows could
  // never be deleted by anyone.
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    return {
      ok: false,
      error: `Could not delete your data (${error.message}). Your sign-in account was NOT deleted — please try again.`,
    };
  }

  // Only now delete the Clerk account itself.
  const client = await clerkClient();
  await client.users.deleteUser(userId);

  redirect("/");
}
