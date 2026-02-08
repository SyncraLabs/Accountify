import type { Metadata, Viewport } from "next";
// import localFont from "next/font/local"; // Disabling Geist for now, standard sans
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthListener } from "@/components/auth/AuthListener";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Accountify",
  description: "Tu Coach de IA y Red Social de Responsabilidad",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Accountify",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${outfit.className} antialiased min-h-screen bg-black text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden`}>
        <AuthListener />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
