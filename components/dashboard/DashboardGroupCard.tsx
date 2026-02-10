import { Users } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DashboardGroupCardProps {
    group: {
        id: string;
        name: string;
        memberCount?: number;
    };
}

import { SpotlightCard } from "@/components/ui/SpotlightCard";

export function DashboardGroupCard({ group }: DashboardGroupCardProps) {
    const t = useTranslations('dashboard.habits');
    return (
        <Link
            href={`/groups?id=${group.id}`}
            className="block h-full group"
        >
            <SpotlightCard className="h-full p-4 rounded-xl bg-[#0f0f10] border border-zinc-800 hover:border-zinc-700 transition-colors hover-lift">
                <div className="flex items-center justify-between mb-2">
                    <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-lg font-bold text-zinc-300 group-hover:text-primary transition-colors">
                        {group.name.substring(0, 2).toUpperCase()}
                    </div>
                    {group.memberCount !== undefined && (
                        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                            <Users className="h-3.5 w-3.5" />
                            <span>{t('members', { count: group.memberCount })}</span>
                        </div>
                    )}
                </div>
                <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                    {group.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-1">{t('viewActivity')}</p>
            </SpotlightCard>
        </Link>
    );
}
