'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CreateGroupDialog } from './CreateGroupDialog'
import { JoinGroupDialog } from './JoinGroupDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'

export function Sidebar({ groups, selectedGroupId }: { groups: any[], selectedGroupId?: string }) {
    return (
        <div className="w-full md:w-72 border-r border-zinc-800/50 bg-zinc-950 flex flex-col h-full">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

            <div className="p-4 border-b border-zinc-800/50 space-y-4 relative">
                <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider px-1">Community</h2>
                <div className="flex flex-col gap-2">
                    <CreateGroupDialog />
                    <JoinGroupDialog />
                </div>
            </div>
            <div className="flex-1 overflow-auto p-2 space-y-1 relative pb-24 md:pb-2">
                {groups.length === 0 && (
                    <div className="text-center p-6 text-zinc-500 text-sm">
                        Aún no te has unido a ningún grupo.
                    </div>
                )}
                {groups.map(group => (
                    <Link
                        key={group.id}
                        href={`/groups?id=${group.id}`}
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "lg" }),
                            "w-full justify-start gap-3 px-3 h-auto py-3 text-zinc-400 transition-all duration-200",
                            "hover:text-white hover:bg-zinc-800/70 hover:shadow-[0_0_20px_rgba(191,245,73,0.05)]",
                            selectedGroupId === group.id && "bg-zinc-800/80 text-white shadow-[0_0_30px_rgba(191,245,73,0.08)] border-l-2 border-primary"
                        )}
                    >
                        <Avatar className="h-9 w-9 border border-zinc-700/50 transition-transform duration-200 group-hover:scale-105">
                            <AvatarImage src={group.avatar_url} />
                            <AvatarFallback className="bg-zinc-800 text-zinc-400 text-xs">{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start overflow-hidden w-full">
                            <span className="font-medium text-sm truncate w-full text-left">{group.name}</span>
                            <span className="text-xs text-zinc-500 truncate w-full text-left">{group.description || 'Sin descripción'}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}


