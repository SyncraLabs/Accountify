import { getUserGroups, getGroupDetails, getGroupMessages } from './actions'
import { Sidebar } from '@/components/groups/Sidebar'
import { ChatArea } from '@/components/groups/ChatArea'
import { GroupInfoSidebar } from '@/components/groups/GroupInfoSidebar'
import { AppSidebar } from "@/components/layout/AppSidebar"
import { MobileNav } from '@/components/layout/MobileNav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function GroupsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { id: selectedGroupId } = await searchParams
    const groups = await getUserGroups()

    let selectedGroup = null
    let messages = [] // Default messages

    if (selectedGroupId) {
        selectedGroup = await getGroupDetails(selectedGroupId)
        if (selectedGroup) {
            const msgResult = await getGroupMessages(selectedGroupId)
            if (msgResult.data) {
                messages = msgResult.data
            }
        }
    }

    return (
        <div className="flex h-screen bg-black overflow-hidden pointer-events-auto">
            {/* Global Sidebar */}
            <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                <AppSidebar />
            </div>
            <MobileNav />

            {/* Combined Main Area */}
            <main className="md:pl-64 flex flex-1 w-full h-full relative">

                {/* Sidebar (List): Hidden on mobile if group selected */}
                <div className={`${selectedGroupId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full z-10 md:z-auto shrink-0`}>
                    <Sidebar groups={groups} selectedGroupId={selectedGroupId} />
                </div>

                {/* Chat Area: Hidden on mobile if NO group selected */}
                <div className={`${selectedGroupId ? 'flex' : 'hidden md:flex'} flex-1 h-full overflow-hidden border-l border-zinc-800/50 bg-zinc-950 relative w-full`}>
                    {/* Subtle ambient glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-transparent pointer-events-none" />

                    {selectedGroupId && selectedGroup ? (
                        <>
                            <ChatArea
                                key={selectedGroupId}
                                groupId={selectedGroupId}
                                groupName={selectedGroup.name}
                                initialMessages={messages}
                                currentUserId={user.id}
                            />
                            {/* Info sidebar hidden on mobile for simplicity, or could handle similarly */}
                            <div className="hidden lg:block">
                                <GroupInfoSidebar group={selectedGroup} currentUserId={user.id} />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 p-8 text-center relative">
                            <div className="bg-zinc-900/50 p-5 rounded-xl mb-4 border border-zinc-800/50 shadow-[0_0_30px_rgba(191,245,73,0.03)]">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                            </div>
                            <h3 className="text-base font-medium text-white mb-2">Grupos de Disciplina</h3>
                            <p className="text-sm max-w-xs text-zinc-500">Selecciona un grupo para chatear.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
