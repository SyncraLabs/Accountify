"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { getGroupLeaderboard, type MemberStats } from "@/app/groups/actions"
import { Loader2, Trophy, Crown, Medal, Award } from "lucide-react"
import { cn } from "@/lib/utils"

interface MemberLeaderboardProps {
    groupId: string
    onMemberClick?: (member: any) => void
    compact?: boolean
}

const rankColors: Record<MemberStats['rank'], string> = {
    'Novato': 'text-zinc-400',
    'Aprendiz': 'text-green-400',
    'Guerrero': 'text-blue-400',
    'Maestro': 'text-purple-400',
    'Leyenda': 'text-yellow-400'
}

const positionIcons = [
    <Crown key={1} className="h-4 w-4 text-yellow-400 fill-yellow-400" />,
    <Medal key={2} className="h-4 w-4 text-zinc-300" />,
    <Award key={3} className="h-4 w-4 text-amber-600" />
]

export function MemberLeaderboard({ groupId, onMemberClick, compact = false }: MemberLeaderboardProps) {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getGroupLeaderboard(groupId)
            .then(result => {
                if (result.leaderboard) {
                    setLeaderboard(result.leaderboard)
                }
            })
            .finally(() => setLoading(false))
    }, [groupId])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
        )
    }

    if (leaderboard.length === 0) {
        return (
            <div className="text-center py-6 text-zinc-500 text-sm">
                No hay miembros en este grupo
            </div>
        )
    }

    const displayMembers = compact ? leaderboard.slice(0, 5) : leaderboard

    return (
        <div className="space-y-2">
            {displayMembers.map((member, index) => {
                const score = member.stats.streak + member.stats.habitsCompleted + member.stats.challengesWon * 50
                const maxScore = Math.max(...leaderboard.map(m =>
                    m.stats.streak + m.stats.habitsCompleted + m.stats.challengesWon * 50
                )) || 1

                return (
                    <button
                        key={member.userId}
                        onClick={() => onMemberClick?.(member)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
                            "bg-zinc-900/50 hover:bg-zinc-800/50 border border-white/5",
                            index === 0 && "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20"
                        )}
                    >
                        {/* Position */}
                        <div className="w-6 flex items-center justify-center shrink-0">
                            {index < 3 ? (
                                positionIcons[index]
                            ) : (
                                <span className="text-xs text-zinc-500 font-medium">{index + 1}</span>
                            )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-8 w-8 border border-zinc-700/50 shrink-0">
                            <AvatarImage src={member.profile?.avatar_url} />
                            <AvatarFallback className="bg-zinc-800 text-xs">
                                {member.profile?.username?.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-white truncate">
                                    {member.profile?.full_name || member.profile?.username || "Usuario"}
                                </span>
                                <span className={cn("text-[10px] font-medium", rankColors[member.stats.rank])}>
                                    {member.stats.rank}
                                </span>
                            </div>
                            {!compact && (
                                <div className="flex items-center gap-3 mt-1">
                                    <Progress
                                        value={(score / maxScore) * 100}
                                        className="h-1 flex-1 bg-zinc-800 [&>div]:bg-primary"
                                    />
                                    <span className="text-[10px] text-zinc-500 shrink-0">
                                        {score} pts
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Stats summary */}
                        <div className="flex items-center gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-[10px] text-orange-400">
                                <span>🔥</span>
                                <span>{member.stats.streak}</span>
                            </div>
                            {!compact && (
                                <>
                                    <div className="flex items-center gap-1 text-[10px] text-green-400">
                                        <span>✓</span>
                                        <span>{member.stats.habitsCompleted}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                                        <Trophy className="h-3 w-3" />
                                        <span>{member.stats.challengesWon}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </button>
                )
            })}

            {compact && leaderboard.length > 5 && (
                <p className="text-center text-xs text-zinc-500 pt-2">
                    +{leaderboard.length - 5} miembros mas
                </p>
            )}
        </div>
    )
}
