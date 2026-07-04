/**
 * Kenya-specific constants: carrier block lines, police stations,
 * KE-CIRT / DCI contacts, high-risk banks. Everything here is public
 * information the user would otherwise have to hunt for while panicking.
 */

export type CarrierId = "safaricom" | "airtel" | "telkom" | "multiple";

export interface CarrierInfo {
  name: string;
  freeFromNetwork: string;
  fromOtherNetwork: string;
  selfCarePortal: string;
  blockPhoneNote: string;
  simBlockScript: string;
}

export const CARRIERS: Record<Exclude<CarrierId, "multiple">, CarrierInfo> = {
  safaricom: {
    name: "Safaricom",
    freeFromNetwork: "100",
    fromOtherNetwork: "+254 722 002 100",
    selfCarePortal: "https://selfcare.safaricom.co.ke",
    blockPhoneNote:
      "Take your OB / police abstract and the IMEI to any Safaricom shop, OR use the Selfcare portal → Products and Services → Operations → Phone → Block Phone.",
    simBlockScript:
      "Say: “I need to block my line immediately, my phone was stolen. Please also lock M-PESA on this line.”",
  },
  airtel: {
    name: "Airtel Kenya",
    freeFromNetwork: "100",
    fromOtherNetwork: "+254 733 100 100",
    selfCarePortal: "https://selfcare.airtel.co.ke",
    blockPhoneNote:
      "Visit any Airtel shop with your ID and the OB number to block the handset IMEI, or raise it via the Selfcare portal.",
    simBlockScript:
      "Say: “My phone was stolen. Block my SIM and Airtel Money right now.”",
  },
  telkom: {
    name: "Telkom Kenya",
    freeFromNetwork: "100",
    fromOtherNetwork: "+254 20 222 1000",
    selfCarePortal: "https://telkom.co.ke",
    blockPhoneNote:
      "Visit a Telkom shop with your ID and OB number to block the handset, or call customer care to block the line.",
    simBlockScript:
      "Say: “My phone was stolen. Block my SIM and T-Kash immediately.”",
  },
};

export function carriersForDevice(carrier: CarrierId): CarrierInfo[] {
  if (carrier === "multiple") return Object.values(CARRIERS);
  return [CARRIERS[carrier]];
}

export const MPESA_WARNING =
  "SIM-swap fraud has drained accounts of KES 450,000+ from real Kenyans. A thief with your SIM can receive your M-PESA and bank one-time PINs. Do not skip this step.";

export const KECIRT = {
  name: "KE-CIRT (National KE-CIRT/CC)",
  email: "incidents@ke-cirt.go.ke",
  phones: ["+254-703-042700", "+254-730-172700"],
  note: "KE-CIRT will not blacklist an IMEI without a police OB number.",
};

export const DCI_CYBERCRIME = {
  name: "DCI Cybercrime Unit",
  tollFree: "0800 722 203",
  whatsapp: "0709 570 000",
};

export const LOSTPHONE_KE = {
  name: "LostPhoneKE",
  url: "https://lostphoneke.web.app",
  fieldsNeeded: [
    "Your full name and phone number",
    "Device make and model",
    "IMEI number(s)",
    "Where and when it was stolen",
    "OB number (if you already have it)",
  ],
};

export const HIGH_RISK_ACCOUNTS = [
  { key: "email", label: "Email (Gmail / Yahoo / Outlook)" },
  { key: "kcb", label: "KCB app / mobile banking" },
  { key: "equity", label: "Equity (Equitel / Eazzy app)" },
  { key: "absa", label: "Absa Kenya app" },
  { key: "coop", label: "Co-operative Bank (MCo-op Cash)" },
  { key: "ncba", label: "NCBA (Loop / NCBA Now)" },
  { key: "stanbic", label: "Stanbic Bank app" },
  { key: "family", label: "Family Bank (PesaPap)" },
  { key: "social", label: "Social media (Facebook, Instagram, X, TikTok)" },
  { key: "whatsapp", label: "WhatsApp — Settings → Linked devices → Log out from all devices; re-register your number on a new phone ASAP so a thief can't." },
];

export const DEVICE_MAKES = [
  "Samsung",
  "Tecno",
  "Apple",
  "Infinix",
  "Redmi / Xiaomi",
  "Oppo",
  "itel",
  "Nokia",
  "Huawei",
  "Google Pixel",
  "OnePlus",
  "Other",
];

export interface PoliceStation {
  name: string;
  area: string;
  address: string;
  phone?: string;
}

/** Seed list of major Nairobi police stations. No maps API in MVP. */
export const NAIROBI_POLICE_STATIONS: PoliceStation[] = [
  { name: "Central Police Station", area: "CBD", address: "University Way, opposite Central Park", phone: "020 222 2222" },
  { name: "Kilimani Police Station", area: "Kilimani", address: "Argwings Kodhek Road" },
  { name: "Kileleshwa Police Station", area: "Kileleshwa", address: "Oloitokitok Road" },
  { name: "Parklands Police Station", area: "Parklands", address: "Ojijo Road" },
  { name: "Pangani Police Station", area: "Pangani", address: "Juja Road" },
  { name: "Kamukunji Police Station", area: "Kamukunji / Eastleigh", address: "Yusuf Haji Avenue" },
  { name: "Shauri Moyo Police Station", area: "Shauri Moyo", address: "Jogoo Road" },
  { name: "Makadara Police Station", area: "Makadara", address: "Jogoo Road, next to Makadara Law Courts" },
  { name: "Buruburu Police Station", area: "Buruburu", address: "Mumias South Road" },
  { name: "Kayole Police Station", area: "Kayole", address: "Kayole Spine Road" },
  { name: "Embakasi Police Station", area: "Embakasi", address: "Airport North Road" },
  { name: "Industrial Area Police Station", area: "Industrial Area", address: "Likoni Road" },
  { name: "Langata Police Station", area: "Lang'ata", address: "Langata Road, near Wilson Airport" },
  { name: "Karen Police Station", area: "Karen", address: "Karen Road" },
  { name: "Kabete Police Station", area: "Westlands / Kabete", address: "Waiyaki Way" },
  { name: "Muthangari Police Station", area: "Lavington / Westlands", address: "Gitanga Road" },
  { name: "Gigiri Police Station", area: "Gigiri / Runda", address: "United Nations Avenue" },
  { name: "Kasarani Police Station", area: "Kasarani", address: "Thika Road, Kasarani" },
  { name: "Ruaraka Police Station", area: "Ruaraka", address: "Baba Dogo Road" },
  { name: "Dandora Police Station", area: "Dandora", address: "Komarock Road" },
  { name: "Huruma Police Station", area: "Huruma / Mathare", address: "Juja Road, Huruma" },
];

export const RECOVERY_RATE_NOTE =
  "Only about 23% of stolen phones in Kenya are ever recovered. Most leave the country or are stripped for parts within hours. The device is probably gone — your money and identity don't have to be.";

/** Pre-filled KE-CIRT incident email. */
export function kecirtEmailTemplate(opts: {
  fullName: string;
  phone: string;
  idNumber?: string | null;
  make: string;
  model: string;
  imeiPrimary: string;
  imeiSecondary?: string | null;
  msisdn?: string | null;
  occurredAt: string;
  locationDescription: string;
  narrative: string;
  obNumber?: string | null;
  policeStation?: string | null;
}): { subject: string; body: string } {
  const {
    fullName, phone, idNumber, make, model, imeiPrimary, imeiSecondary,
    msisdn, occurredAt, locationDescription, narrative, obNumber, policeStation,
  } = opts;
  const subject = `Stolen phone — IMEI blacklist request — ${make} ${model} (IMEI ${imeiPrimary})`;
  const body = [
    "Dear KE-CIRT team,",
    "",
    "I wish to report a stolen mobile phone and request that its IMEI be blacklisted.",
    "",
    `Full name: ${fullName}`,
    idNumber ? `National ID number: ${idNumber}` : null,
    `Contact phone: ${phone}`,
    "",
    `Device: ${make} ${model}`,
    `IMEI 1: ${imeiPrimary}`,
    imeiSecondary ? `IMEI 2: ${imeiSecondary}` : null,
    msisdn ? `Phone number on the stolen device: ${msisdn}` : null,
    "",
    `Date and time of theft: ${occurredAt}`,
    `Location: ${locationDescription}`,
    `What happened: ${narrative}`,
    "",
    obNumber
      ? `Police OB number: ${obNumber}${policeStation ? ` (${policeStation})` : ""}`
      : "Police OB number: to follow — I am in the process of obtaining it.",
    "",
    "Please confirm receipt and advise on any further steps.",
    "",
    "Kind regards,",
    fullName,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
  return { subject, body };
}
