import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { CommandPalette } from "@/components/common/CommandPalette";
import { Footer } from "@/components/common/Footer";
import { LegalCopilotWidget } from "@/components/common/LegalCopilotWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3010"),
  title: {
    default: "LegalAI BD — AI-Powered Legal Drafting for Bangladesh",
    template: "%s | LegalAI BD",
  },
  description:
    "Automate FIRs, CR Cases, and Legal Notices in Bengali. Tailored for Advocates in Bangladesh.",
  keywords: [
    "Legal AI Bangladesh",
    "BD Laws",
    "FIR Draft Bengali",
    "Supreme Court of Bangladesh",
    "Advocate SaaS Bangladesh",
    "CrPC CPC Penal Code",
    "লিগ্যাল ড্রাফটিং",
    "এজাহার ড্রাফট",
    "দেওয়ানি আরজি",
  ],
  authors: [{ name: "LegalAI BD Team" }],
  openGraph: {
    title: "LegalAI BD — AI-Powered Legal Drafting for Bangladesh",
    description:
      "Automate FIRs, CR Cases, and Legal Notices in Bengali. Tailored for Advocates in Bangladesh.",
    url: "http://localhost:3010",
    siteName: "LegalAI BD",
    locale: "bn_BD",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LegalAI BD - AI Legal Drafting Platform for Bangladeshi Advocates",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LegalAI BD — AI-Powered Legal Drafting for Bangladesh",
    description:
      "Automate FIRs, CR Cases, and Legal Notices in Bengali. Tailored for Advocates in Bangladesh.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-800">
        <div className="flex-1 flex flex-col">{children}</div>
        <Footer />
        <CommandPalette />
        <LegalCopilotWidget />
      </body>
    </html>
  );
}
