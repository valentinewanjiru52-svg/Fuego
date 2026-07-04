import { notFound } from "next/navigation";
import { DeviceForm } from "@/components/device-form";
import { getDevice } from "@/lib/data";

export const metadata = { title: "Edit device — Fuego" };

export default async function EditDevicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const device = await getDevice(id);
  if (!device) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Edit {device.nickname}</h1>
      <DeviceForm device={device} />
    </div>
  );
}
