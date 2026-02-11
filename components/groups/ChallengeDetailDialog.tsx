'use client'

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Trophy, Clock, Users, LogOut, Loader2 } from "lucide-react"
import { getChallengeLeaderboard, joinChallenge, leaveChallenge } from "@/app/[locale]/groups/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LogProgressDialog } from "./LogProgressDialog"

interface ChallengeDetailDialogProps {
    challenge: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onUpdate: () => void
}

export function ChallengeDetailDialog({ challenge, open, onOpenChange, onUpdate }: ChallengeDetailDialogProps) {
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [showLogDialog, setShowLogDialog] = useState(false)

    useEffect(() => {
        if (open && challenge) {
            loadLeaderboard()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, challenge])

    const loadLeaderboard = async () => {
        const { leaderboard, error } = await getChallengeLeaderboard(challenge.id)
        if (error) {
            console.error(error)
            return
        }
        setLeaderboard(leaderboard || [])
    }

    const handleJoin = async () => {
        setLoading(true)
        try {
            const result = await joinChallenge(challenge.id)
            if (result.error) throw new Error(result.error)
            toast.success("Te has unido al reto")
            onUpdate()
            loadLeaderboard()
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLeave = async () => {
        if (!confirm("¿Estás seguro de querer abandonar este reto? Perderás tu progreso.")) return

        setLoading(true)
        try {
            const result = await leaveChallenge(challenge.id)
            if (result.error) throw new Error(result.error)
            toast.success("Has abandonado el reto")
            onUpdate()
            onOpenChange(false)
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (!challenge) return null

    const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const progressPercent = Math.min(100, (challenge.userProgress / challenge.target_value) * 100)

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {challenge.title}
                            {challenge.userProgress >= challenge.target_value && (
                                <Trophy className="h-5 w-5 text-green-500" />
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* Meta Info */}
                        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                            <div className="flex flex-col items-center justify-center text-center gap-1">
                                <Clock className="h-4 w-4 text-zinc-400" />
                                <span className="text-xs text-zinc-500">Tiempo Restante</span>
                                <span className="font-medium">{daysLeft > 0 ? `${daysLeft} días` : 'Finalizado'}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1 border-x border-zinc-800">
                                <Trophy className="h-4 w-4 text-primary" />
                                <span className="text-xs text-zinc-500">Objetivo</span>
                                <span className="font-medium">{challenge.target_value} {challenge.unit}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center text-center gap-1">
                                <Users className="h-4 w-4 text-zinc-400" />
                                <span className="text-xs text-zinc-500">Participantes</span>
                                <span className="font-medium">{leaderboard.length}</span>
                            </div>
                        </div>

                        {/* Description */}
                        {challenge.description && (
                            <p className="text-zinc-400 text-sm">{challenge.description}</p>
                        )}

                        {/* User Progress */}
                        {challenge.isJoined ? (
                            <div className="space-y-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h4 className="text-sm font-medium mb-1">Tu Progreso</h4>
                                        <p className="text-2xl font-bold text-white">
                                            {challenge.userProgress} <span className="text-sm font-normal text-zinc-500">/ {challenge.target_value} {challenge.unit}</span>
                                        </p>
                                    </div>
                                    <Button onClick={() => setShowLogDialog(true)} className="bg-primary text-black hover:bg-primary/90">
                                        Registrar
                                    </Button>
                                </div>
                                <Progress value={progressPercent} className="h-2 bg-zinc-800" />
                            </div>
                        ) : (
                            <Button
                                className="w-full bg-primary text-black hover:bg-primary/90 transition-all duration-200"
                                onClick={handleJoin}
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Uniéndose...
                                    </>
                                ) : "Unirse al Reto"}
                            </Button>
                        )}

                        {/* Leaderboard */}
                        <div className="space-y-4">
                            <h3 className="font-medium text-lg border-b border-zinc-800 pb-2">Ranking</h3>
                            <div className="space-y-2">
                                {leaderboard.map((entry, index) => {
                                    // Note: need current user id passed or deduced, but `isJoined` logic helps.
                                    // Actually we don't have current user ID easily available here without passing it.
                                    // For visual flair we highlight top 3
                                    const rankColor = index === 0 ? "text-yellow-500" : index === 1 ? "text-gray-400" : index === 2 ? "text-amber-600" : "text-zinc-500"

                                    return (
                                        <div key={entry.userId} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                            <div className={cn("font-bold w-6 text-center", rankColor)}>#{index + 1}</div>
                                            <Avatar className="h-8 w-8 border border-zinc-800">
                                                <AvatarImage src={entry.profile?.avatar_url} />
                                                <AvatarFallback>{entry.profile?.full_name?.substring(0, 2)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <span className="text-sm font-medium truncate">{entry.profile?.full_name}</span>
                                                    <span className="text-xs font-mono text-zinc-400">{entry.progress} {challenge.unit}</span>
                                                </div>
                                                <Progress value={(entry.progress / challenge.target_value) * 100} className="h-1 bg-zinc-800" />
                                            </div>
                                        </div>
                                    )
                                })}
                                {leaderboard.length === 0 && (
                                    <p className="text-center text-zinc-500 text-sm py-4">Sé el primero en unirte.</p>
                                )}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        {challenge.isJoined && (
                            <div className="flex justify-center pt-2">
                                <Button
                                    variant="ghost"
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-950/20 text-xs transition-all duration-200"
                                    onClick={handleLeave}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                    ) : (
                                        <LogOut className="h-3 w-3 mr-2" />
                                    )}
                                    {loading ? "Abandonando..." : "Abandonar Reto"}
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <LogProgressDialog
                challenge={challenge}
                open={showLogDialog}
                onOpenChange={setShowLogDialog}
                onSuccess={() => {
                    onUpdate()
                    loadLeaderboard()
                }}
            />
        </>
    )
}
