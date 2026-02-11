import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google"; // Disabling Geist for now, standard sans
import { Toaster } from "@/components/ui/sonner";
import { AuthListener } from "@/components/auth/AuthListener";
import { CelebrationProvider } from "@/components/ui/dopamine";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={`${outfit.className} antialiased min-h-[100dvh] bg-black text-foreground selection:bg-primary/30 selection:text-primary-foreground overflow-x-hidden`}>
        <NextIntlClientProvider messages={messages}>
          <CelebrationProvider>
            <AuthListener />
            {children}
            <Toaster />
          </CelebrationProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
