import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DynamicFavicon from "@/components/DynamicFavicon";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MR.MKOFFICIAL | Premium AI Art Prompts & Customizer",
  description: "Discover, customize, and copy high-quality AI art templates from MR.MKOFFICIAL. Premium macOS/iOS style prompt collection.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <DynamicFavicon />
        {children}
      </body>
    </html>
  );
}
