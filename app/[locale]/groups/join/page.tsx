'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { joinGroup } from '@/app/[locale]/groups/actions'
import { Button } from '@/components/ui/button'
import { Loader2, Users, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

function JoinGroupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const code = searchParams.get('code')

    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        if (code) {
            handleJoin()
        }
    }, [code])

    const handleJoin = async () => {
        if (!code) return

        setStatus('loading')
        const result = await joinGroup(code)

        if (result.error) {
            setStatus('error')
            setErrorMessage(result.error)
            toast.error(result.error)
        } else {
            setStatus('success')
            toast.success('¡Te uniste al grupo!')
            setTimeout(() => {
                router.push(`/groups?id=${result.groupId}`)
            }, 1500)
        }
    }

    return (
        <div className="max-w-md w-full bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800 p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                {status === 'loading' ? (
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                ) : status === 'success' ? (
                    <CheckCircle className="h-8 w-8 text-green-500" />
                ) : status === 'error' ? (
                    <XCircle className="h-8 w-8 text-red-500" />
                ) : (
                    <Users className="h-8 w-8 text-primary" />
                )}
            </div>

            {/* Title */}
            <h1 className="text-xl font-semibold text-white mb-2">
                {status === 'loading' && 'Uniéndote al grupo...'}
                {status === 'success' && '¡Te has unido!'}
                {status === 'error' && 'Error al unirse'}
                {status === 'idle' && 'Unirse al Grupo'}
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-sm mb-6">
                {status === 'loading' && 'Por favor espera mientras te unimos al grupo.'}
                {status === 'success' && 'Redirigiendo al grupo...'}
                {status === 'error' && errorMessage}
                {status === 'idle' && !code && 'No se proporcionó código de invitación.'}
                {status === 'idle' && code && `Código: ${code}`}
            </p>

            {/* Actions */}
            {status === 'error' && (
                <div className="space-y-3">
                    <Button
                        onClick={handleJoin}
                        className="w-full bg-primary text-black hover:bg-primary/90"
                    >
                        Intentar de nuevo
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/groups')}
                        className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                        Ir a Grupos
                    </Button>
                </div>
            )}

            {status === 'idle' && !code && (
                <Button
                    onClick={() => router.push('/groups')}
                    className="w-full bg-primary text-black hover:bg-primary/90"
                >
                    Ir a Grupos
                </Button>
            )}
        </div>
    )
}

export default function JoinGroupPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-white">Cargando...</div>}>
                <JoinGroupContent />
            </Suspense>
        </div>
    )
}
