import { CheckCircle2, Flame, Calendar, Users } from "lucide-react";
import { useTranslations } from 'next-intl';

interface DashboardStatsProps {
    completedToday: number;
    totalHabits: number;
    activeGroups: number;
    totalCompleted: number;
}

export function DashboardStats({ completedToday, totalHabits, activeGroups }: DashboardStatsProps) {
    const t = useTranslations('dashboard.stats');
    const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#0f0f10] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CheckCircle2 className="h-24 w-24 text-primary" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400">{t('dailyProgress')}</h3>
                        <p className="text-xs text-zinc-600 mt-1">{t('habitsCompletedToday')}</p>
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{completedToday}</span>
                        <span className="text-lg text-zinc-600 mb-1">/ {totalHabits}</span>
                    </div>
                    <div className="w-full bg-zinc-900 rounded-full h-1.5 mt-auto">
                        <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[#0f0f10] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Flame className="h-24 w-24 text-orange-500" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400">{t('syncLevel')}</h3>
                        <p className="text-xs text-zinc-600 mt-1">{t('consistencyScore')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white">{completionPercentage}%</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                        {completionPercentage === 100 ? t('perfectDay') : t('keepPushing')}
                    </p>
                </div>
            </div>

            <div className="bg-[#0f0f10] border border-zinc-800 rounded-xl p-6 relative overflow-hidden group hover:border-zinc-700 transition-all">
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Users className="h-24 w-24 text-blue-500" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-zinc-400">{t('activeGroups')}</h3>
                        <p className="text-xs text-zinc-600 mt-1">{t('disciplineCircles')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-bold text-white">{activeGroups}</span>
                    </div>
                    <p className="text-xs text-zinc-500">
                        {t('stayAccountable')}
                    </p>
                </div>
            </div>
        </div>
    );
}
