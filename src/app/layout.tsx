import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SessionProvider } from "@/components/auth/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Last Paradigm - Alignment Tax Calculator",
  description: "Discover how much misalignment costs your organization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
