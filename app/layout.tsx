import type { Metadata, Viewport } from "next";
import { siteUrl } from "@/lib/config";
import "./globals.css";

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
  themeColor: "#fbf5ea",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-NG" className="antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
