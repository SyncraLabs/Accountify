export default function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="relative flex flex-col items-center">
                {/* Pulsing Glow Effect */}
                <div className="absolute inset-0 h-32 w-32 animate-pulse rounded-full bg-primary/20 blur-3xl" />

                {/* Animated Logo Container */}
                <div className="relative h-16 w-16 animate-bounce">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.svg" alt="Loading..." className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                </div>

                {/* Loading Text */}
                <div className="mt-8 flex flex-col items-center gap-2">
                    <h2 className="text-xl font-medium tracking-tight text-foreground/80 animate-pulse">
                        Accountify
                    </h2>
                    <div className="flex gap-1">
                        <span className="h-1.5 w-1.5 animate-[bounce_1s_infinite_0ms] rounded-full bg-primary" />
                        <span className="h-1.5 w-1.5 animate-[bounce_1s_infinite_200ms] rounded-full bg-primary" />
                        <span className="h-1.5 w-1.5 animate-[bounce_1s_infinite_400ms] rounded-full bg-primary" />
                    </div>
                </div>
            </div>
        </div>
    );
}
