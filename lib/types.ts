import type { CarrierId } from "@/lib/kenya";

export interface Profile {
  id: string; // Clerk user id
  email: string | null;
  phone_e164: string | null;
  full_name: string | null;
  id_number: string | null;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  nickname: string;
  make: string;
  model: string;
  color: string | null;
  imei_primary: string;
  imei_secondary: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  purchase_location: string | null;
  carrier: CarrierId;
  msisdn: string | null;
  google_account_email: string | null;
  icloud_account_email: string | null;
  created_at: string;
  is_active: boolean;
}

export type IncidentStatus =
  | "reporting"
  | "filed"
  | "resolved_recovered"
  | "resolved_written_off";

export interface Incident {
  id: string;
  user_id: string;
  device_id: string;
  occurred_at: string;
  location_description: string;
  narrative: string;
  ob_number: string | null;
  police_station: string | null;
  kecirt_reference: string | null;
  kecirt_reported: boolean;
  carrier_block_confirmed: boolean;
  mpesa_locked: boolean;
  google_account_signed_out: boolean;
  icloud_signed_out: boolean;
  lostphoneke_registered: boolean;
  passwords_changed: boolean;
  financial_loss: boolean;
  dci_reported: boolean;
  status: IncidentStatus;
  created_at: string;
}

export interface IncidentWithDevice extends Incident {
  devices: Device;
}
