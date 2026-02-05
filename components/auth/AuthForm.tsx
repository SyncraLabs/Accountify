"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "@/app/login/actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowRight, Mail, Lock, User, AtSign, Github } from "lucide-react"
import Image from "next/image"

export function AuthForm() {
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [mode, setMode] = useState<"login" | "signup">("login")
    const message = searchParams.get('message')

    useEffect(() => {
        if (message) {
            if (message.includes("Error")) {
                toast.error(message.replace("Error:", ""))
            } else {
                toast.info(message)
            }
        }
    }, [message])

    // Simple transition handler
    const toggleMode = (newMode: "login" | "signup") => {
        setMode(newMode)
    }

    async function handleSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            if (mode === "login") {
                await login(formData)
            } else {
                await signup(formData)
            }
        } catch (error) {
            console.error(error)
            toast.error("Ocurrió un error inesperado")
        } finally {
            // In a redirect scenario, this might not run if unmounted, but that's fine
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md p-8 rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col items-center mb-8 relative z-10">
                <div className="h-12 w-12 relative mb-4">
                    <Image
                        src="/logo.svg"
                        alt="Accountify Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Accountify</h1>
                <p className="text-sm text-zinc-400 mt-2 text-center max-w-[280px]">
                    {mode === "login"
                        ? "Bienvenido de nuevo, futuro imparable."
                        : "Comienza tu viaje hacia la excelencia."}
                </p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 p-1 mb-8 bg-zinc-900/80 rounded-lg border border-white/5 relative z-10">
                <button
                    onClick={() => toggleMode("login")}
                    className={`text-sm font-medium py-2 rounded-md transition-all duration-300 ${mode === "login"
                        ? "bg-zinc-800 text-white shadow-lg"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Iniciar Sesión
                </button>
                <button
                    onClick={() => toggleMode("signup")}
                    className={`text-sm font-medium py-2 rounded-md transition-all duration-300 ${mode === "signup"
                        ? "bg-zinc-800 text-white shadow-lg"
                        : "text-zinc-500 hover:text-zinc-300"
                        }`}
                >
                    Registrarse
                </button>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="relative z-10 space-y-5">
                <AnimatePresence mode="wait">
                    {mode === "signup" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -20 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-2 overflow-hidden"
                        >
                            <Label htmlFor="fullName" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Nombre</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="Tu Nombre"
                                    className="pl-9 h-10 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

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

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Contraseña</Label>
                        {mode === "login" && (
                            <Link href="/login/forgot-password" className="text-[10px] text-primary hover:text-primary/80 transition-colors">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        )}
                    </div>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="••••••••"
                            className="pl-9 h-10 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-primary/50 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    {mode === "signup" && (
                        <p className="text-[10px] text-zinc-500 ml-1">Mínimo 6 caracteres</p>
                    )}
                </div>

                <div className="pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-primary text-black hover:bg-primary/90 font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]"
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <span className="flex items-center justify-center">
                                {mode === "login" ? "Entrar Ahora" : "Crear Mi Cuenta"}
                                {mode === "signup" && <ArrowRight className="ml-2 h-4 w-4" />}
                            </span>
                        )}
                    </Button>
                </div>
            </form>

            {/* Social / Divider */}
            {/* <div className="mt-8 relative z-10">
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#09090b] px-2 text-zinc-500 font-medium">O continúa con</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                   <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">
                        <Github className="mr-2 h-4 w-4" /> Github
                   </Button>
                   <Button variant="outline" className="h-10 border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300">
                        <AtSign className="mr-2 h-4 w-4" /> Google
                   </Button>
                </div>
            </div> */}
        </div>
    )
}
