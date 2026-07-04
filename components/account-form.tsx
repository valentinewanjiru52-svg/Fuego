"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteAccount, updateProfile } from "@/app/actions/profile";
import type { Profile } from "@/lib/types";

export function AccountForm({ profile }: { profile: Profile }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setMessage(null);
    startTransition(async () => {
      const result = await updateProfile(formData);
      setMessage(
        result.ok
          ? { kind: "ok", text: "Profile saved." }
          : { kind: "error", text: result.error ?? "Something went wrong." },
      );
    });
  }

  function onDelete() {
    if (
      confirm(
        "Delete your account? This permanently removes your profile, all registered devices, and all incident records. This cannot be undone.",
      )
    ) {
      startTransition(async () => {
        // On success the action redirects and never resolves with a value.
        const result = await deleteAccount();
        if (result && !result.ok) {
          setMessage({ kind: "error", text: result.error ?? "Deletion failed — please try again." });
        }
      });
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="full_name">Full name (as on your National ID) *</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
        </div>

        <div className="space-y-1">
          <Label htmlFor="id_number">National ID number</Label>
          <Input
            id="id_number"
            name="id_number"
            inputMode="numeric"
            defaultValue={profile.id_number ?? ""}
            placeholder="Strongly encouraged — needed for OB filing"
          />
          <p className="text-xs text-muted-foreground">
            Pre-fills your OB Kit and the script you read to your carrier. Stored in your
            private vault; only you can see it.
          </p>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone_e164">Contact phone (+254 format)</Label>
          <Input
            id="phone_e164"
            name="phone_e164"
            defaultValue={profile.phone_e164 ?? ""}
            placeholder="+254712345678"
          />
          <p className="text-xs text-muted-foreground">
            A number we can put on the OB as your contact — ideally not the phone that might get
            stolen.
          </p>
        </div>

        <div className="space-y-1">
          <Label>Email</Label>
          <Input value={profile.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">Managed through your sign-in account.</p>
        </div>

        {message && (
          <p className={message.kind === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>
            {message.text}
          </p>
        )}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save profile"}
        </Button>
      </form>

      <div className="rounded-lg border border-red-200 p-4">
        <h2 className="font-semibold text-red-800">Danger zone</h2>
        <p className="mb-3 mt-1 text-sm text-muted-foreground">
          Deleting your account removes your profile, devices, and incident history permanently.
        </p>
        <Button variant="destructive" onClick={onDelete} disabled={pending}>
          Delete my account
        </Button>
      </div>
    </div>
  );
}
