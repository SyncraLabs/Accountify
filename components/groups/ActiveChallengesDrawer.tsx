"use client"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react"
import { getGroupChallenges } from "@/app/groups/actions"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface ActiveChallengesDrawerProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
}

export function ActiveChallengesDrawer({ isOpen, onOpenChange, groupId }: ActiveChallengesDrawerProps) {
    const [challenges, setChallenges] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            getGroupChallenges(groupId)
                .then(result => {
                    if (result.challenges) {
                        setChallenges(result.challenges)
                    }
                })
                .finally(() => setLoading(false))
        }
    }, [isOpen, groupId])

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-[85vw] sm:w-[400px] border-l border-white/10 bg-zinc-950 text-white p-0">
                <SheetHeader className="p-6 border-b border-white/10 text-left">
                    <SheetTitle className="flex items-center gap-2 text-xl">
                        <Trophy className="h-5 w-5 text-yellow-400" />
                        Retos Activos
                    </SheetTitle>
                    <SheetDescription className="text-zinc-400">
                        Progreso y desafíos actuales del grupo
                    </SheetDescription>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-100px)]">
                    <div className="p-6 space-y-6">
                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-32 rounded-xl bg-zinc-900/50 animate-pulse" />
                                ))}
                            </div>
                        ) : challenges.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>No hay retos activos en este momento.</p>
                            </div>
                        ) : (
                            challenges.map((challenge) => (
                                <div
                                    key={challenge.id}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800/50 border border-white/5 p-4 transition-all hover:border-white/10"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-lg text-white mb-1 group-hover:text-primary transition-colors">
                                                {challenge.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 border-none">
                                                    {challenge.challenge_type === 'collective' ? 'Grupal' : 'Individual'}
                                                </Badge>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(challenge.end_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-400">Progreso</span>
                                            <span className="font-medium text-white">
                                                {challenge.userProgress || 0} / {challenge.target_value} {challenge.unit}
                                            </span>
                                        </div>

                                        <Progress
                                            value={Math.min(100, ((challenge.userProgress || 0) / challenge.target_value) * 100)}
                                            className="h-2 bg-zinc-800"
                                        />

                                        <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                                            <div className="flex items-center gap-1">
                                                <TrendingUp className="h-3 w-3" />
                                                <span>{challenge.participantCount} participantes</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
