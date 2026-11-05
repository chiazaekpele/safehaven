import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { siteUrl } from "@/lib/config";
import "./globals.css";

// Closest match to the flyer's lettering; self-hosted by Next.js at build time.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-poppins",
  display: "swap",
});

const title = "Safe Haven Foundation — 3rd Edition Food Drive";
const description =
  "Students carry so much. We can't fix every problem, but we can offer a meal when it's needed most. ₦1,200 feeds one student this exam season.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "/",
    siteName: "Safe Haven Foundation",
    locale: "en_NG",
    type: "website",
  },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: "#fffdf8",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className={`${poppins.variable} antialiased`}>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
