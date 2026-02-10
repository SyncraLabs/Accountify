import { AuthForm } from "@/components/auth/AuthForm"
import { Suspense } from "react"

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black p-4 bg-[url('/grid.svg')] bg-center">
            <Suspense fallback={<div className="text-zinc-500">Cargando...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    )
}

