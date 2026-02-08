"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy, Flame, Target, CalendarDays, Medal, Star, Loader2 } from "lucide-react"
import { getMemberStats, type MemberStats } from "@/app/groups/actions"
import { cn } from "@/lib/utils"

interface MemberProfileDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    member: {
        id: string
        username?: string
        full_name?: string
        avatar_url?: string
        role?: string
        joined_at?: string
    } | null
}

const rankColors: Record<MemberStats['rank'], string> = {
    'Novato': 'text-zinc-400 bg-zinc-800',
    'Aprendiz': 'text-green-400 bg-green-500/20',
    'Guerrero': 'text-blue-400 bg-blue-500/20',
    'Maestro': 'text-purple-400 bg-purple-500/20',
    'Leyenda': 'text-yellow-400 bg-yellow-500/20'
}

const rankIcons: Record<MemberStats['rank'], string> = {
    'Novato': '🌱',
    'Aprendiz': '📚',
    'Guerrero': '⚔️',
    'Maestro': '🎯',
    'Leyenda': '👑'
}

export function MemberProfileDialog({ isOpen, onOpenChange, member }: MemberProfileDialogProps) {
    const [stats, setStats] = useState<MemberStats | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && member?.id) {
            setLoading(true)
            getMemberStats(member.id)
                .then(result => {
                    if (result.stats) {
                        setStats(result.stats)
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [isOpen, member?.id])

    if (!member) return null

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 p-0 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent">
                    <div className="absolute -bottom-12 left-6">
                        <Avatar className="h-24 w-24 border-4 border-zinc-950 shadow-xl">
                            <AvatarImage src={member.avatar_url} />
                            <AvatarFallback className="bg-zinc-800 text-2xl">
                                {member.username?.slice(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                <div className="pt-14 px-6 pb-6 space-y-6">
                    <div>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-white">
                                {member.full_name || member.username || "Usuario"}
                            </h2>
                            <Badge variant={member.role === 'admin' ? "default" : "secondary"} className="bg-zinc-800 text-zinc-300">
                                {member.role === 'admin' ? 'Admin' : 'Miembro'}
                            </Badge>
                        </div>
                        <p className="text-zinc-500">@{member.username || "usuario"}</p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                        </div>
                    ) : stats ? (
                        <>
                            {/* Rank Section */}
                            <div className="bg-gradient-to-br from-zinc-900 to-zinc-900/50 p-4 rounded-xl border border-white/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{rankIcons[stats.rank]}</span>
                                        <div>
                                            <span className={cn("text-sm font-semibold px-2 py-0.5 rounded", rankColors[stats.rank])}>
                                                {stats.rank}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-zinc-500">
                                        {stats.rankProgress}% al siguiente nivel
                                    </span>
                                </div>
                                <Progress
                                    value={stats.rankProgress}
                                    className="h-2 bg-zinc-800 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-green-400"
                                />
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                                        <Flame className="h-5 w-5 fill-current" />
                                    </div>
                                    <div>
                                        <span className="block text-lg font-bold text-white">{stats.streak}</span>
                                        <span className="text-[10px] text-zinc-500">Racha</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                                        <Target className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-lg font-bold text-white">{stats.habitsCompleted}</span>
                                        <span className="text-[10px] text-zinc-500">Completados</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                                        <Trophy className="h-5 w-5 fill-current" />
                                    </div>
                                    <div>
                                        <span className="block text-lg font-bold text-white">{stats.challengesWon}</span>
                                        <span className="text-[10px] text-zinc-500">Retos Ganados</span>
                                    </div>
                                </div>

                                <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                                        <Medal className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="block text-lg font-bold text-white">{stats.commitmentScore}%</span>
                                        <span className="text-[10px] text-zinc-500">Compromiso</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            No se pudieron cargar las estadisticas
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-zinc-600 justify-center pt-2">
                        <CalendarDays className="h-3 w-3" />
                        Unido el {new Date(member.joined_at || Date.now()).toLocaleDateString()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
