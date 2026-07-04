import { DeviceForm } from "@/components/device-form";

export const metadata = { title: "Register a device — Fuego" };

export default function NewDevicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Register a device</h1>
      <p className="mb-6 mt-1 text-muted-foreground">
        Two minutes now saves you hours at the police station later.
      </p>
      <DeviceForm />
    </div>
  );
}
