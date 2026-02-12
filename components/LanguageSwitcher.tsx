"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTransition } from "react";

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();

    const toggleLanguage = () => {
        const nextLocale = locale === 'en' ? 'es' : 'en';
        startTransition(() => {
            router.replace(pathname, { locale: nextLocale });
        });
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            disabled={isPending}
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg px-3 h-9"
        >
            <Globe className="h-4 w-4" />
            <span className="text-sm font-medium">{locale.toUpperCase()}</span>
        </Button>
    );
}
