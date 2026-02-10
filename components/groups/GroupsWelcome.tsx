'use client'

import { motion } from 'framer-motion'
import { Users, Trophy, MessageCircle, Share2, Target, Flame, Sparkles, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
}

export function GroupsWelcome({ className }: { className?: string }) {
    const t = useTranslations('groups.welcome')

    const features = [
        {
            icon: MessageCircle,
            title: t('features.chat.title'),
            description: t('features.chat.desc'),
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20'
        },
        {
            icon: Trophy,
            title: t('features.challenges.title'),
            description: t('features.challenges.desc'),
            color: 'text-amber-400',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20'
        },
        {
            icon: Share2,
            title: t('features.share.title'),
            description: t('features.share.desc'),
            color: 'text-green-400',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20'
        },
        {
            icon: Target,
            title: t('features.progress.title'),
            description: t('features.progress.desc'),
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20'
        }
    ]

    return (
        <div className={`flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden ${className}`}>
            {/* Animated background gradients */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] animate-pulse delay-700" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-2xl w-full text-center relative z-10"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="mb-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">{t('badge')}</span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        {t('titlePrefix')}{' '}
                        <span className="text-primary">{t('titleSuffix')}</span>
                    </h1>

                    <p className="text-zinc-400 text-lg max-w-md mx-auto leading-relaxed">
                        {t('description')}
                    </p>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-2 gap-4 mb-10"
                >
                    {features.map((feature) => (
                        <motion.div
                            key={feature.title}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className={`p-5 rounded-2xl ${feature.bgColor} border ${feature.borderColor} text-left transition-all duration-200 hover:shadow-lg`}
                        >
                            <div className={`inline-flex p-2.5 rounded-xl ${feature.bgColor} mb-3`}>
                                <feature.icon className={`h-5 w-5 ${feature.color}`} />
                            </div>
                            <h3 className="text-sm font-semibold text-white mb-1">{feature.title}</h3>
                            <p className="text-xs text-zinc-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Call to Action */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{t('cta.create')}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-600" />
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Share2 className="h-4 w-4 text-primary" />
                            <span>{t('cta.invite')}</span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-600" />
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Flame className="h-4 w-4 text-primary" />
                            <span>{t('cta.grow')}</span>
                        </div>
                    </div>

                    <p className="text-xs text-zinc-500 mt-6">
                        {t('selectGroup')}
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
