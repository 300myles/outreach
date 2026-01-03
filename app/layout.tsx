import type React from "react";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css"; // Import globals.css here
import Providers from "@/context/Providers";

const _geistSans = Geist({ subsets: ["latin"] });
// const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OutreachAI - Email Outreach Platform",
  description:
    "Send targeted emails at scale. Import leads, create campaigns, manage multiple Gmail accounts, and track engagement in one platform.",
  keywords:
    "email outreach, email marketing, lead generation, gmail automation, campaign management",
  openGraph: {
    title: "OutreachAI",
    description:
      "The ultimate email outreach platform for restaurants and businesses",
    type: "website",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${_geistSans.className}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
