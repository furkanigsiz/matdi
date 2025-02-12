import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { ClientLayout } from "./client-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sevgilim için özel site",
  description: "Sana özel hazırlanmış bir site",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${inter.className} bg-zinc-900 text-white`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
} 