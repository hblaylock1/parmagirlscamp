import type { Metadata } from "next";
import { Alfa_Slab_One, Playball } from "next/font/google";
import "./globals.css";
import { EVENT } from "@/lib/event";

const display = Alfa_Slab_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});
const script = Playball({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export const metadata: Metadata = {
  title: EVENT.title,
  description: EVENT.metaDescription,
  openGraph: {
    title: EVENT.title,
    description: EVENT.metaDescription,
    url: "/",
    siteName: EVENT.title,
    images: [
      {
        url: "/logo.png",
        alt: EVENT.title,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: EVENT.title,
    description: EVENT.metaDescription,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${script.variable}`}>
      <body>{children}</body>
    </html>
  );
}
