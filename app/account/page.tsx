import { AccountForm } from "@/components/account-form";
import { ensureProfile } from "@/lib/data";

export const metadata = { title: "Account — Fuego" };

export default async function AccountPage() {
  const profile = await ensureProfile();

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mb-8 mt-1 text-muted-foreground">
        These details pre-fill your OB Kit and carrier scripts — fill them in before you need
        them.
      </p>
      <AccountForm profile={profile} />
    </div>
  );
}
