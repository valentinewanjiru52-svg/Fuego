import * as React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { Device, Incident, Profile } from "@/lib/types";
import { CARRIERS } from "@/lib/kenya";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica", color: "#111" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 2 },
  subtitle: { fontSize: 10, color: "#555", marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    backgroundColor: "#eef4ef",
    padding: 4,
    marginBottom: 6,
  },
  row: { flexDirection: "row", marginBottom: 3 },
  label: { width: 160, color: "#555" },
  value: { flex: 1, fontFamily: "Helvetica-Bold" },
  mono: { fontFamily: "Courier-Bold", fontSize: 13, letterSpacing: 1 },
  narrative: { lineHeight: 1.5 },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 8,
    color: "#888",
    textAlign: "center",
  },
});

function Row({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  if (!value) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={mono ? [styles.value, styles.mono] : styles.value}>{value}</Text>
    </View>
  );
}

export interface ObKitProps {
  profile: Profile;
  device: Device;
  incident?: Incident | null;
  generatedAt: Date;
}

/**
 * One-page PDF the user hands to the desk officer when filing the OB.
 * Everything the officer needs to copy, in the order they'll ask for it.
 */
export function ObKitDocument({ profile, device, incident, generatedAt }: ObKitProps) {
  const carrierName =
    device.carrier === "multiple" ? "Multiple carriers (dual SIM)" : CARRIERS[device.carrier]?.name;

  return (
    <Document title={`OB Kit — ${device.make} ${device.model}`} author="Fuego">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Stolen Phone Report — OB Filing Kit</Text>
        <Text style={styles.subtitle}>
          Prepared {generatedAt.toUTCString()} · For presentation at a Kenya Police station when
          requesting an Occurrence Book (OB) entry.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Complainant</Text>
          <Row label="Full name" value={profile.full_name} />
          <Row label="National ID number" value={profile.id_number} />
          <Row label="Contact phone" value={profile.phone_e164} />
          <Row label="Email" value={profile.email} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Stolen device</Text>
          <Row label="Make and model" value={`${device.make} ${device.model}`} />
          <Row label="Color" value={device.color} />
          <Row label="IMEI 1" value={device.imei_primary} mono />
          <Row label="IMEI 2 (dual SIM)" value={device.imei_secondary} mono />
          <Row label="Serial number" value={device.serial_number} />
          <Row label="Carrier" value={carrierName} />
          <Row label="Phone number on device" value={device.msisdn} />
          <Row label="Purchase date" value={device.purchase_date} />
          <Row label="Purchased from" value={device.purchase_location} />
        </View>

        {incident ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Incident details</Text>
            <Row label="Date and time of theft" value={new Date(incident.occurred_at).toUTCString()} />
            <Row label="Location" value={incident.location_description} />
            <View style={{ marginTop: 4 }}>
              <Text style={{ color: "#555", marginBottom: 2 }}>What happened:</Text>
              <Text style={styles.narrative}>{incident.narrative}</Text>
            </View>
            <View style={{ marginTop: 6 }}>
              <Row label="OB number (if issued)" value={incident.ob_number ?? "____________________"} />
              <Row label="Police station" value={incident.police_station ?? "____________________"} />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Incident details</Text>
            <Text style={{ color: "#555" }}>
              To be completed at the station: date/time of theft, location, and a short
              description of what happened.
            </Text>
            <View style={{ marginTop: 8 }}>
              <Row label="OB number (if issued)" value="____________________" />
              <Row label="Police station" value="____________________" />
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Requested actions</Text>
          <Text style={styles.narrative}>
            The complainant requests: (a) an OB entry recording the theft of the above device;
            (b) a police abstract if required for carrier and insurance follow-up. The IMEI
            above will also be submitted to the National KE-CIRT/CC
            (incidents@ke-cirt.go.ke) for blacklisting, which requires the OB number.
          </Text>
        </View>

        <Text style={styles.footer}>
          Generated by Fuego (phone theft response, Kenya). This document is a filing aid
          prepared from the owner&apos;s pre-registered device vault — it is not an official
          police document.
        </Text>
      </Page>
    </Document>
  );
}
