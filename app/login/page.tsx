"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "./actions"
import { toast } from "sonner"
import { useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { ShieldCheck } from "lucide-react"

function LoginForm() {
    const searchParams = useSearchParams()
    const message = searchParams.get('message')

    useEffect(() => {
        if (message) {
            toast.info(message)
        }
    }, [message])

    return (
        <div className="w-full max-w-sm p-8 rounded-xl border border-zinc-800 bg-zinc-900/50">
            <div className="flex flex-col items-center mb-8">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-4">
                    <ShieldCheck className="h-5 w-5 text-black" />
                </div>
                <h1 className="text-xl font-semibold text-white">Accountify</h1>
                <p className="text-sm text-zinc-500 mt-1">Ingresa o crea tu cuenta</p>
            </div>
            <form>
                <div className="grid w-full items-center gap-5">
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="email" className="text-xs text-zinc-400">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="tu@email.com" required className="h-10 bg-zinc-800/50 border-zinc-700 text-sm" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="password" className="text-xs text-zinc-400">Contraseña</Label>
                        <Input id="password" name="password" type="password" required className="h-10 bg-zinc-800/50 border-zinc-700 text-sm" />
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label htmlFor="fullName" className="text-xs text-zinc-400">Nombre Completo (Solo Registro)</Label>
                        <Input id="fullName" name="fullName" placeholder="Tu Nombre" className="h-10 bg-zinc-800/50 border-zinc-700 text-sm" />
                    </div>
                </div>
                <div className="flex flex-col gap-3 mt-8">
                    <Button formAction={login} className="h-10 bg-primary text-black hover:bg-primary/90 font-medium">Iniciar Sesión</Button>
                    <Button formAction={signup} variant="outline" className="h-10 border-zinc-700 text-zinc-300 hover:bg-zinc-800">Registrarse</Button>
                </div>
            </form>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black p-4">
            <Suspense fallback={<div className="text-zinc-500">Cargando...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    )
}

