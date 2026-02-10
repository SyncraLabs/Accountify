"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Trophy, ChevronRight, Flame, Users } from "lucide-react"
import { getGroupChallenges } from "@/app/[locale]/groups/actions"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ChallengeProgressBarProps {
    groupId: string
    onOpenChallenges: () => void
}

export function ChallengeProgressBar({ groupId, onOpenChallenges }: ChallengeProgressBarProps) {
    const [challenges, setChallenges] = useState<any[]>([])
    const [activeIndex, setActiveIndex] = useState(0)
    const [loading, setLoading] = useState(true)
    const t = useTranslations('groups.challenges')

    useEffect(() => {
        setLoading(true)
        getGroupChallenges(groupId)
            .then(result => {
                if (result.challenges) {
                    // Filter only active challenges where user has joined
                    const activeChallenges = result.challenges.filter((c: any) => c.isParticipant)
                    setChallenges(activeChallenges)
                }
            })
            .finally(() => setLoading(false))
    }, [groupId])

    // Rotate through challenges every 5 seconds if multiple
    useEffect(() => {
        if (challenges.length <= 1) return
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % challenges.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [challenges.length])

    if (loading) {
        return (
            <div className="h-12 bg-zinc-900/50 border-b border-zinc-800/50 animate-pulse" />
        )
    }

    if (challenges.length === 0) {
        return (
            <button
                onClick={onOpenChallenges}
                className="w-full h-12 bg-gradient-to-r from-zinc-900/80 to-zinc-900/50 border-b border-zinc-800/50 flex items-center justify-between px-4 hover:bg-zinc-800/50 transition-colors group"
            >
                <div className="flex items-center gap-2 text-zinc-500">
                    <Trophy className="h-4 w-4" />
                    <span className="text-xs">{t('bar.empty')}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary group-hover:translate-x-1 transition-transform">
                    <span>{t('bar.view')}</span>
                    <ChevronRight className="h-3 w-3" />
                </div>
            </button>
        )
    }

    const challenge = challenges[activeIndex]
    const progress = Math.min(100, ((challenge.userProgress || 0) / challenge.target_value) * 100)
    const isCompleted = progress >= 100
    const daysLeft = Math.max(0, Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

    return (
        <button
            onClick={onOpenChallenges}
            className="w-full bg-gradient-to-r from-zinc-900/80 via-zinc-900/60 to-zinc-900/40 border-b border-zinc-800/50 hover:from-zinc-800/80 hover:via-zinc-800/60 hover:to-zinc-800/40 transition-all group"
        >
            <div className="px-4 py-2">
                {/* Challenge info row */}
                <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        <div className={cn(
                            "h-6 w-6 rounded-full flex items-center justify-center shrink-0",
                            isCompleted ? "bg-green-500/20 text-green-400" : "bg-primary/20 text-primary"
                        )}>
                            {isCompleted ? (
                                <Trophy className="h-3 w-3 fill-current" />
                            ) : (
                                <Flame className="h-3 w-3" />
                            )}
                        </div>
                        <span className="text-xs font-medium text-white truncate">
                            {challenge.title}
                        </span>
                        {challenges.length > 1 && (
                            <span className="text-[10px] text-zinc-600 shrink-0">
                                {activeIndex + 1}/{challenges.length}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                            <Users className="h-3 w-3" />
                            <span>{challenge.participantCount}</span>
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium px-1.5 py-0.5 rounded",
                            daysLeft <= 1 ? "bg-red-500/20 text-red-400" :
                                daysLeft <= 3 ? "bg-amber-500/20 text-amber-400" :
                                    "bg-zinc-800 text-zinc-400"
                        )}>
                            {daysLeft === 0 ? t('labels.today') : daysLeft === 1 ? t('labels.dayLeft') : t('labels.daysLeft', { count: daysLeft })}
                        </span>
                        <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                    <Progress
                        value={progress}
                        className={cn(
                            "h-1.5 flex-1",
                            isCompleted ? "[&>div]:bg-green-500" : "[&>div]:bg-primary"
                        )}
                    />
                    <span className={cn(
                        "text-[10px] font-medium min-w-[3rem] text-right",
                        isCompleted ? "text-green-400" : "text-zinc-400"
                    )}>
                        {challenge.userProgress || 0}/{challenge.target_value}
                    </span>
                </div>
            </div>
        </button>
    )
}
