'use client'

import { useState, useEffect } from "react"
import { getGroupChallenges, joinChallenge, leaveChallenge, logChallengeProgress } from "@/app/groups/actions"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Trophy, Users, Calendar, ArrowRight, Loader2, Target, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { CreateChallengeDialog } from "./CreateChallengeDialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GroupChallenges({ groupId, isAdmin }: { groupId: string, isAdmin: boolean }) {
    const [challenges, setChallenges] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState<string | null>(null)
    const [loggingProgressId, setLoggingProgressId] = useState<string | null>(null)
    const [progressValue, setProgressValue] = useState("")

    const fetchChallenges = async () => {
        setIsLoading(true)
        const result = await getGroupChallenges(groupId)
        if (result.challenges) {
            setChallenges(result.challenges)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchChallenges()
    }, [groupId])

    const handleJoin = async (challengeId: string) => {
        setUpdatingId(challengeId)
        const result = await joinChallenge(challengeId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Te has unido al reto")
            fetchChallenges()
        }
        setUpdatingId(null)
    }

    const handleLeave = async (challengeId: string) => {
        if (!confirm("¿Estás seguro de que quieres abandonar el reto? Perderás tu progreso.")) return

        setUpdatingId(challengeId)
        const result = await leaveChallenge(challengeId)
        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Has abandonado el reto")
            fetchChallenges()
        }
        setUpdatingId(null)
    }

    const handleLogProgress = async (challengeId: string) => {
        if (!progressValue) return

        setUpdatingId(challengeId)
        const val = parseInt(progressValue)
        const result = await logChallengeProgress(challengeId, val)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success("Progreso registrado")
            setLoggingProgressId(null)
            setProgressValue("")
            fetchChallenges()
        }
        setUpdatingId(null)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {isAdmin && (
                <CreateChallengeDialog groupId={groupId} onChallengeCreated={fetchChallenges} />
            )}

            {challenges.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                    <Trophy className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No hay retos activos en este momento.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {challenges.map((challenge) => (
                        <div key={challenge.id} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-white font-medium flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        {challenge.title}
                                    </h3>
                                    <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{challenge.description}</p>
                                </div>
                                <div className="bg-zinc-800/50 px-2 py-1 rounded text-xs text-zinc-400 font-mono">
                                    {challenge.target_value} {challenge.unit}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-zinc-500">
                                <div className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {challenge.participantCount} participantes
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {Math.ceil((new Date(challenge.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes
                                </div>
                            </div>

                            {challenge.isJoined ? (
                                <div className="space-y-3 pt-2 border-t border-zinc-800/50">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-zinc-400">Tu progreso</span>
                                        <span className="text-white font-medium">
                                            {challenge.userProgress} / {challenge.target_value} {challenge.unit}
                                        </span>
                                    </div>
                                    <Progress value={(challenge.userProgress / challenge.target_value) * 100} className="h-2" />

                                    <div className="flex gap-2 mt-2">
                                        <Dialog open={loggingProgressId === challenge.id} onOpenChange={(open) => setLoggingProgressId(open ? challenge.id : null)}>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="flex-1 bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-xs">
                                                    Registrar
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
                                                <DialogHeader>
                                                    <DialogTitle>Registrar Progreso: {challenge.title}</DialogTitle>
                                                </DialogHeader>
                                                <div className="py-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <Label>Cantidad ({challenge.unit})</Label>
                                                        <Input
                                                            type="number"
                                                            value={progressValue}
                                                            onChange={(e) => setProgressValue(e.target.value)}
                                                            className="bg-zinc-900 border-zinc-800"
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={() => handleLogProgress(challenge.id)}
                                                        disabled={!progressValue || updatingId === challenge.id}
                                                        className="w-full"
                                                    >
                                                        {updatingId === challenge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar"}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>

                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 text-xs px-2"
                                            onClick={() => handleLeave(challenge.id)}
                                            disabled={updatingId === challenge.id}
                                        >
                                            Abandonar
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                                    onClick={() => handleJoin(challenge.id)}
                                    disabled={updatingId === challenge.id}
                                >
                                    {updatingId === challenge.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unirse al Reto"}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
