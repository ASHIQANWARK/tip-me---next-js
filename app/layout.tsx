import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tip Me",
  description: "Tip Me mobile tipping interface",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}