import { ReportWizard } from "@/components/report-wizard";
import { ensureProfile, getDevices } from "@/lib/data";

export const metadata = { title: "Report a theft — Fuego" };

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ device?: string }>;
}) {
  const [profile, devices, params] = await Promise.all([
    ensureProfile(),
    getDevices(),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-red-700">Phone stolen — let&apos;s move.</h1>
      <p className="mb-8 mt-2 text-muted-foreground">
        Three quick questions, then your 60-minute response plan.
      </p>
      <ReportWizard profile={profile} devices={devices} preselectedDeviceId={params.device} />
    </div>
  );
}
