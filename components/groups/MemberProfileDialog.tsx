"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Flame, Target, CalendarDays, Medal } from "lucide-react"

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
    stats?: {
        streak: number
        habitsCompleted: number
        challengesWon: number
        commitmentScore: number // 0-100
    }
}

export function MemberProfileDialog({ isOpen, onOpenChange, member, stats }: MemberProfileDialogProps) {
    if (!member) return null

    // Mock stats if not provided (placeholder for now as per plan)
    const secureStats = stats || {
        streak: Math.floor(Math.random() * 20),
        habitsCompleted: Math.floor(Math.random() * 100),
        challengesWon: Math.floor(Math.random() * 5),
        commitmentScore: Math.floor(Math.random() * 40) + 60
    }

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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Flame className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white">{secureStats.streak}</span>
                                <span className="text-xs text-zinc-500">Racha Actual</span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                <Target className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white">{secureStats.habitsCompleted}</span>
                                <span className="text-xs text-zinc-500">Hábitos Completados</span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
                                <Trophy className="h-5 w-5 fill-current" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white">{secureStats.challengesWon}</span>
                                <span className="text-xs text-zinc-500">Retos Ganados</span>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Medal className="h-5 w-5" />
                            </div>
                            <div>
                                <span className="block text-xl font-bold text-white">{secureStats.commitmentScore}%</span>
                                <span className="text-xs text-zinc-500">Compromiso</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-600 justify-center pt-2">
                        <CalendarDays className="h-3 w-3" />
                        Unido el {new Date(member.joined_at || Date.now()).toLocaleDateString()}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
