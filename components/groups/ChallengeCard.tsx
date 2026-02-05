'use client'

import { Trophy, Clock, Users, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ChallengeCardProps {
    challenge: {
        id: string
        title: string
        description?: string
        target_value: number
        unit: string
        end_date: string
        participantCount: number
        userProgress: number
        isJoined: boolean
    }
    onClick: () => void
}

export function ChallengeCard({ challenge, onClick }: ChallengeCardProps) {
    const progressPercent = Math.min(100, (challenge.userProgress / challenge.target_value) * 100)
    const daysLeft = Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    const isCompleted = challenge.userProgress >= challenge.target_value

    return (
        <div
            onClick={onClick}
            className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-800/50 cursor-pointer"
        >
            {/* Status Indicator */}
            <div className={cn(
                "absolute top-0 left-0 w-1 h-full transition-colors",
                isCompleted ? "bg-green-500" : challenge.isJoined ? "bg-primary" : "bg-zinc-700"
            )} />

            <div className="pl-3 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-medium text-white flex items-center gap-2">
                            {challenge.title}
                            {isCompleted && <Trophy className="h-3 w-3 text-green-500" />}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-zinc-500 mt-1">
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {daysLeft > 0 ? `${daysLeft}d restantes` : 'Finalizado'}
                            </span>
                            <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {challenge.participantCount}
                            </span>
                        </div>
                    </div>

                    {!challenge.isJoined && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded-full uppercase tracking-wider font-medium">
                            Unirse
                        </span>
                    )}
                </div>

                {/* Progress */}
                {challenge.isJoined && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                            <span className={cn(
                                "font-medium",
                                isCompleted ? "text-green-500" : "text-zinc-300"
                            )}>
                                {challenge.userProgress} / {challenge.target_value} {challenge.unit}
                            </span>
                            <span className="text-zinc-500">{Math.round(progressPercent)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5 bg-zinc-800" />
                    </div>
                )}
            </div>
        </div>
    )
}
