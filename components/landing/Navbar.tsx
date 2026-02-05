import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md border-b border-white/5 -z-10" />

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.svg" alt="Accountify" width={28} height={28} className="rounded" />
                <span className="text-base font-semibold tracking-tight text-white">Accountify</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
                <Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Características
                </Link>
                <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
                    Cómo Funciona
                </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <Link href="/login">
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-sm">
                        Iniciar Sesión
                    </Button>
                </Link>
                <Link href="/login?view=signup">
                    <Button size="sm" className="bg-primary text-black hover:bg-primary/90 text-sm font-medium h-9 px-4 rounded-full">
                        Comenzar
                    </Button>
                </Link>
            </div>
        </header>
    );
}

