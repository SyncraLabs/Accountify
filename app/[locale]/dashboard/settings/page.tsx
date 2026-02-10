import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getTranslations } from "next-intl/server";

export default async function SettingsPage() {
    const t = await getTranslations('dashboard.settings');

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>
            <div className="bg-[#0f0f10] border border-zinc-800 rounded-xl p-6">
                <h2 className="text-lg font-medium mb-4">{t('language')}</h2>
                <div className="flex items-center justify-between">
                    <p className="text-zinc-400">{t('selectLanguage')}</p>
                    <LanguageSwitcher />
                </div>
            </div>
        </div>
    );
}
