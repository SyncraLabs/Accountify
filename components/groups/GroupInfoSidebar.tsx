'use client'

import { useState, useEffect } from 'react'
import { Trophy, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InviteDialog } from "./InviteDialog"
import { GroupSettingsDialog } from "./GroupSettingsDialog"
import { MembersListDialog } from "./MembersListDialog"
import { ChallengesSection } from "./ChallengesSection"
import { isUserGroupAdmin } from "@/app/groups/actions"
import Image from "next/image"

interface GroupInfoSidebarProps {
    group: {
        id: string
        name: string
        description?: string
        invite_code: string
        avatar_url?: string
    }
    currentUserId?: string
    onGroupUpdate?: () => void
}

export function GroupInfoSidebar({ group, currentUserId, onGroupUpdate }: GroupInfoSidebarProps) {
    const [copied, setCopied] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkAdmin = async () => {
            const admin = await isUserGroupAdmin(group.id)
            setIsAdmin(admin)
        }
        checkAdmin()
    }, [group.id])

    const copyCode = () => {
        navigator.clipboard.writeText(group.invite_code)
        setCopied(true)
        toast.success("¡Código copiado!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="w-60 border-l border-zinc-800/50 bg-zinc-900/30 hidden lg:block p-4 space-y-5 h-full overflow-y-auto relative">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

            {/* Group Info Header */}
            <div className="relative flex flex-col items-center text-center pb-4 border-b border-zinc-800/50">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-800 mb-3">
                    {group.avatar_url ? (
                        <Image
                            src={group.avatar_url}
                            alt={group.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xl font-bold">
                            {group.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h2 className="text-sm font-medium text-white">{group.name}</h2>
                {group.description && (
                    <p className="text-xs text-zinc-500 mt-1">{group.description}</p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="relative space-y-1">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                    Acciones
                </h3>

                {/* Settings (Admin only) */}
                {isAdmin && (
                    <GroupSettingsDialog group={group} onUpdate={onGroupUpdate} />
                )}

                {/* Invite Members */}
                <InviteDialog inviteCode={group.invite_code} groupName={group.name} />

                {/* View Members */}
                <MembersListDialog
                    groupId={group.id}
                    isAdmin={isAdmin}
                    currentUserId={currentUserId}
                />
            </div>

            {/* Quick Invite Code */}
            <div className="relative">
                <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Código Rápido</h3>
                <div className="p-2.5 rounded-lg bg-zinc-800/30 border border-zinc-700/30 transition-all duration-200 hover:border-primary/20">
                    <div className="flex items-center gap-2">
                        <code className="bg-zinc-900/80 px-2.5 py-1 rounded text-sm font-mono flex-1 text-center text-primary tracking-widest">
                            {group.invite_code}
                        </code>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all duration-200"
                            onClick={copyCode}
                        >
                            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Challenges Section */}
            <div className="relative">
                <ChallengesSection groupId={group.id} isAdmin={isAdmin} />
            </div>
        </div>
    )
}
