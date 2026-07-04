import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fuego — Phone stolen in Kenya? Act in the first 60 minutes.",
  description:
    "Pre-register your phone. If it's stolen, get a carrier-specific response plan: block your SIM, lock M-PESA, file the OB, blacklist the IMEI with KE-CIRT.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 text-center text-sm text-muted-foreground">
            <p>
              Fuego — built for Kenya. Free during beta. Emergencies: Police 999 / 112 · DCI
              Cybercrime 0800 722 203
            </p>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
