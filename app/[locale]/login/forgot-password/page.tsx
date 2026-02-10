"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { resetPassword } from "@/app/[locale]/login/actions"
import { toast } from "sonner"
import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Mail, ArrowLeft, Loader2 } from "lucide-react"
import { useFormStatus } from "react-dom"

function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    useEffect(() => {
        if (message) {
            if (message.includes("Error")) {
                toast.error(message.replace("Error:", ""))
            } else {
                toast.success(message)
            }
        }
    }, [message])

    // Client component for the button to show loading state
    function SubmitButton() {
        const { pending } = useFormStatus()

        return (
            <Button
                type="submit"
                disabled={pending}
                className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]"
            >
                {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar Instrucciones"}
            </Button>
        )
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="h-12 w-12 relative mb-4">
                    <Image
                        src="/logo.svg"
                        alt="Accountify Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar Contraseña</h1>
                <p className="text-sm text-zinc-400 mt-2 text-center max-w-[280px]">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu acceso.
                </p>
            </div>

            <form action={resetPassword} className="relative z-10 space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Email</Label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="tu@email.com"
                            required
                            className="pl-9 h-10 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <SubmitButton />
                </div>

                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Volver a Iniciar Sesión
                    </Link>
                </div>
            </form>
        </div>
    )
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black p-4 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
            <Suspense fallback={<div className="text-zinc-500">Cargando...</div>}>
                <ForgotPasswordForm />
            </Suspense>
        </div>
    )
}
