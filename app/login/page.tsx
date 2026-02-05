import { AuthForm } from "@/components/auth/AuthForm"
import { Suspense } from "react"

export default function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-black p-4 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]">
            <Suspense fallback={<div className="text-zinc-500">Cargando...</div>}>
                <AuthForm />
            </Suspense>
        </div>
    )
}

