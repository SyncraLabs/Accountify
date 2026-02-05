import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-center p-4">
            {/* Background Glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-secondary/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 space-y-6 max-w-md mx-auto">
                {/* 404 Visual */}
                <div className="relative mx-auto h-40 w-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse blur-xl" />
                    <div className="text-9xl font-bold bg-gradient-to-b from-primary to-primary/20 bg-clip-text text-transparent drop-shadow-2xl">
                        404
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
                        Página no encontrada
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Parece que te has perdido en el espacio. La página que buscas no existe o ha sido movida.
                    </p>
                </div>

                <div className="pt-4">
                    <Link href="/dashboard">
                        <Button size="lg" className="gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                            <MoveLeft className="h-4 w-4" />
                            Volver al inicio
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
