import type { Metadata } from "next";
// import localFont from "next/font/local"; // Disabling Geist for now, standard sans
import { Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { AuthListener } from "@/components/auth/AuthListener";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Accountify",
  description: "Tu Coach de IA y Red Social de Responsabilidad",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${outfit.className} antialiased min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-primary-foreground`}>
        <AuthListener />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
