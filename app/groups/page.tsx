import { getUserGroups, getGroupDetails, getGroupMessages, hasCompletedGroupsOnboarding } from './actions'
import { Sidebar } from '@/components/groups/Sidebar'
import { ChatArea } from '@/components/groups/ChatArea'
import { GroupsWelcome } from '@/components/groups/GroupsWelcome'

import { GroupsPageClient } from '@/components/groups/GroupsPageClient'
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
    const [groups, hasCompletedOnboarding] = await Promise.all([
        getUserGroups(),
        hasCompletedGroupsOnboarding()
    ])

    let selectedGroup = null
    let messages = [] // Default messages

    if (selectedGroupId) {
        selectedGroup = await getGroupDetails(selectedGroupId)
        if (selectedGroup) {
            const msgResult = await getGroupMessages(selectedGroupId, 50)
            if (msgResult.data) {
                messages = msgResult.data
            }
        }
    }

    return (
        <GroupsPageClient showOnboarding={!hasCompletedOnboarding}>
            <div className="flex h-screen-safe bg-black overflow-hidden pointer-events-auto no-overscroll">
                {/* Global Sidebar */}
                <div className="hidden md:block w-64 fixed inset-y-0 z-50">
                    <AppSidebar />
                </div>
                {!selectedGroupId && <MobileNav />}

                {/* Combined Main Area */}
                <main className="md:pl-64 flex flex-1 w-full h-full relative">

                    {/* Sidebar (List): Hidden on mobile if group selected */}
                    <div className={`${selectedGroupId ? 'hidden md:flex' : 'flex'} w-full md:w-auto h-full z-10 md:z-auto shrink-0`}>
                        <Sidebar groups={groups} selectedGroupId={selectedGroupId} />
                    </div>

                    {/* Chat Area: Hidden on mobile if NO group selected */}
                    <div className={`${selectedGroupId ? 'flex flex-col absolute inset-0 md:static z-50' : 'hidden md:flex md:flex-col'} flex-1 h-full border-l border-zinc-800/50 bg-zinc-950 w-full`}>
                        {selectedGroupId && selectedGroup ? (
                            <ChatArea
                                key={selectedGroupId}
                                groupId={selectedGroupId}
                                groupName={selectedGroup.name}
                                initialMessages={messages}
                                currentUserId={user.id}
                            />
                        ) : (
                            <GroupsWelcome />
                        )}
                    </div>
                </main>
            </div>
        </GroupsPageClient>
    )
}
