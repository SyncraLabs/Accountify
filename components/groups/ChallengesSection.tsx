'use client'

import { useState, useEffect } from "react"
import { Trophy, Loader2 } from "lucide-react"
import { getGroupChallenges } from "@/app/[locale]/groups/actions"
import { ChallengeCard } from "./ChallengeCard"
import { CreateChallengeDialog } from "./CreateChallengeDialog"
import { ChallengeDetailDialog } from "./ChallengeDetailDialog"
import { Button } from "@/components/ui/button"

interface ChallengesSectionProps {
    groupId: string
    isAdmin: boolean
}

export function ChallengesSection({ groupId, isAdmin }: ChallengesSectionProps) {
    const [challenges, setChallenges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedChallenge, setSelectedChallenge] = useState<any>(null)
    const [detailOpen, setDetailOpen] = useState(false)

    const loadChallenges = async () => {
        const { challenges, error } = await getGroupChallenges(groupId)
        if (error) {
            console.error(error)
            return
        }
        setChallenges(challenges || [])
        setLoading(false)
    }

    useEffect(() => {
        loadChallenges()
    }, [groupId])

    const handleChallengeClick = (challenge: any) => {
        setSelectedChallenge(challenge)
        setDetailOpen(true)
    }

    if (loading) {
        return (
            <div className="flex justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="h-3.5 w-3.5 text-primary" />
                    Retos Activos
                </h3>
            </div>

            <div className="space-y-2">
                {challenges.map(challenge => (
                    <ChallengeCard
                        key={challenge.id}
                        challenge={challenge}
                        onClick={() => handleChallengeClick(challenge)}
                    />
                ))}

                {challenges.length === 0 && (
                    <div className="text-center p-4 border border-dashed border-zinc-800 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-2">No hay retos activos</p>
                        {isAdmin && (
                            <CreateChallengeDialog
                                groupId={groupId}
                                onChallengeCreated={loadChallenges}
                            />
                        )}
                    </div>
                )}

                {challenges.length > 0 && isAdmin && (
                    <div className="pt-2">
                        <CreateChallengeDialog
                            groupId={groupId}
                            onChallengeCreated={loadChallenges}
                        />
                    </div>
                )}
            </div>

            <ChallengeDetailDialog
                challenge={selectedChallenge}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onUpdate={() => {
                    loadChallenges()
                    // Update selected challenge local state if needed
                    // For simplicity, re-fetching list updates everything, 
                    // and we might close dialog or refetch detail inside dialog
                }}
            />
        </div>
    )
}
