'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { CreateGroupDialog } from './CreateGroupDialog'
import { JoinGroupDialog } from './JoinGroupDialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, Trophy, Flame, MessageCircle, Sparkles } from 'lucide-react'

import { GroupsWelcome } from './GroupsWelcome'

import { useTranslations } from 'next-intl'

export function Sidebar({ groups, selectedGroupId }: { groups: any[], selectedGroupId?: string }) {
    const t = useTranslations('groups.sidebar')

    return (
        <div className="w-full md:w-80 border-r border-zinc-800/50 bg-zinc-950 flex flex-col h-full relative">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent pointer-events-none" />

            {/* Header Section */}
            <div className="p-5 border-b border-zinc-800/50 space-y-4 relative">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-sm font-semibold text-white">{t('title')}</h2>
                        <p className="text-[10px] text-zinc-500">{t('subtitle')}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <CreateGroupDialog />
                    </div>
                    <div className="flex-1">
                        <JoinGroupDialog />
                    </div>
                </div>
            </div>

            {/* Groups List */}
            <div className="flex-1 overflow-auto p-3 space-y-2 relative pb-24 md:pb-3">
                {/* Mobile Welcome Section */}
                <div className="md:hidden mb-6">
                    <GroupsWelcome className="p-0 py-4 min-h-0 flex-none" />
                </div>
                {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mb-4">
                            <Sparkles className="h-7 w-7 text-zinc-600" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-300 mb-1">{t('noGroups')}</h3>
                        <p className="text-xs text-zinc-500 max-w-[200px]">
                            {t('createFirst')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between px-1 mb-2">
                            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                {t('yourGroups')} ({groups.length})
                            </span>
                        </div>
                        {groups.map(group => (
                            <Link
                                key={group.id}
                                href={`/groups?id=${group.id}`}
                                className={cn(
                                    "group w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200",
                                    "hover:bg-zinc-800/60 hover:shadow-lg",
                                    selectedGroupId === group.id
                                        ? "bg-zinc-800/80 shadow-[0_0_30px_rgba(191,245,73,0.06)] ring-1 ring-primary/30"
                                        : "bg-zinc-900/30 hover:ring-1 hover:ring-zinc-700/50"
                                )}
                            >
                                <Avatar className={cn(
                                    "h-12 w-12 border-2 transition-all duration-200 shrink-0",
                                    selectedGroupId === group.id
                                        ? "border-primary/50 shadow-[0_0_15px_rgba(191,245,73,0.2)]"
                                        : "border-zinc-700/50 group-hover:border-zinc-600"
                                )}>
                                    <AvatarImage src={group.avatar_url} />
                                    <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm font-medium">
                                        {group.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "font-medium text-sm truncate",
                                            selectedGroupId === group.id ? "text-white" : "text-zinc-200 group-hover:text-white"
                                        )}>
                                            {group.name}
                                        </span>
                                        {selectedGroupId === group.id && (
                                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                    <span className="text-xs text-zinc-500 truncate mt-0.5">
                                        {group.description || t('defaultDesc')}
                                    </span>

                                    {/* Feature Pills - Hidden on mobile */}
                                    <div className="hidden md:flex items-center gap-2 mt-2">
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 text-[10px] text-zinc-400">
                                            <MessageCircle className="h-3 w-3" />
                                            <span>{t('features.chat')}</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 text-[10px] text-zinc-400">
                                            <Trophy className="h-3 w-3 text-amber-500" />
                                            <span>{t('features.challenges')}</span>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-800/80 text-[10px] text-zinc-400">
                                            <Flame className="h-3 w-3 text-orange-500" />
                                            <span>{t('features.progress')}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </>
                )}
            </div>

            {/* Bottom Feature Highlight - Hidden on mobile */}
            {groups.length > 0 && (
                <div className="hidden md:block p-4 border-t border-zinc-800/50 bg-gradient-to-t from-zinc-900/50 to-transparent">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Trophy className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-zinc-200">{t('shareProgress')}</p>
                            <p className="text-[10px] text-zinc-500">{t('inspireOthers')}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}


