'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, MessageSquare, AtSign, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/lib/supabase/client'
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, type Notification } from '@/app/[locale]/notifications/actions'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'

const notificationIcons: Record<string, React.ReactNode> = {
    mention: <AtSign className="h-4 w-4 text-primary" />,
    group_message: <MessageSquare className="h-4 w-4 text-blue-400" />,
    habit_reminder: <Zap className="h-4 w-4 text-amber-400" />,
    feature_update: <Zap className="h-4 w-4 text-purple-400" />
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Fetch notifications on mount
    useEffect(() => {
        fetchData()
    }, [])

    // Realtime subscription for new notifications
    useEffect(() => {
        const channel = supabase
            .channel('notifications_realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new as Notification
                    setNotifications(prev => [newNotification, ...prev])
                    setUnreadCount(prev => prev + 1)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    const fetchData = async () => {
        setLoading(true)
        const [notifResult, countResult] = await Promise.all([
            getNotifications(10, 0),
            getUnreadCount()
        ])
        setNotifications(notifResult.notifications)
        setUnreadCount(countResult.count)
        setLoading(false)
    }

    const handleMarkAsRead = async (notification: Notification) => {
        if (!notification.read) {
            await markAsRead(notification.id)
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        }

        // Navigate if there's a group_id in data
        if (notification.data?.group_id) {
            router.push(`/groups?g=${notification.data.group_id}`)
            setIsOpen(false)
        }
    }

    const handleMarkAllAsRead = async () => {
        await markAllAsRead()
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'ahora'
        if (diffMins < 60) return `${diffMins}m`
        if (diffHours < 24) return `${diffHours}h`
        return `${diffDays}d`
    }

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                >
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-[10px] font-bold text-black flex items-center justify-center shadow-[0_0_10px_rgba(191,245,73,0.4)]"
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96 max-w-[calc(100vw-2rem)] p-0 bg-zinc-900/95 border-zinc-800 backdrop-blur-xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                    <h3 className="font-medium text-sm text-white">Notificaciones</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-7 text-xs text-zinc-400 hover:text-white"
                        >
                            <CheckCheck className="h-3.5 w-3.5 mr-1" />
                            Marcar todo
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="max-h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="py-12 text-center text-zinc-500 text-sm">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            No tienes notificaciones
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-800/50">
                            {notifications.map((notification) => (
                                <motion.button
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification)}
                                    className={`w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors ${!notification.read ? 'bg-primary/[0.03]' : ''
                                        }`}
                                    whileHover={{ x: 2 }}
                                    transition={{ duration: 0.1 }}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                            {notificationIcons[notification.type]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm truncate ${!notification.read ? 'text-white font-medium' : 'text-zinc-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-zinc-500 flex-shrink-0">
                                                    {formatTime(notification.created_at)}
                                                </span>
                                            </div>
                                            {notification.body && (
                                                <p className="text-xs text-zinc-500 mt-0.5 truncate">
                                                    {notification.body}
                                                </p>
                                            )}
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-4 py-2 border-t border-zinc-800">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                router.push('/settings')
                                setIsOpen(false)
                            }}
                            className="w-full text-xs text-zinc-400 hover:text-white"
                        >
                            Configurar notificaciones
                        </Button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
