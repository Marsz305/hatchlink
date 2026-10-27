import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HatchLink Zimbabwe | Traceable fertilised eggs",
  description: "A managed marketplace for inspected, traceable fertilised poultry eggs in Zimbabwe.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-ZW">
      <body className="antialiased">{children}</body>
    </html>
  );
}
