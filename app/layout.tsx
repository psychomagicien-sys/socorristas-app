import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";
import EmergencyButton from "@/components/EmergencyButton";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Socorristas Emocionales",
  description: "Acompañamiento emocional puntual con practicantes certificados O.R.A.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Socorristas",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className={`${geist.className} min-h-full flex flex-col bg-stone-50 text-stone-900`}>
        {children}
        <EmergencyButton />
        <CookieBanner />
      </body>
    </html>
  );
}
