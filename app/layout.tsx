import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextChatSDKBootstrap } from "@/components/NextChatSDKBootstrap";
import baseURL from "@/baseUrl";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calcufy - Smart Calculator",
  description: "A beautiful calculator app for ChatGPT with MCP integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* CRITICAL: NextChatSDKBootstrap patches browser APIs for iframe */}
        <NextChatSDKBootstrap baseUrl={baseURL} />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
