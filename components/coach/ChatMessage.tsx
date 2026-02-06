"use client";

import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import { motion } from "framer-motion";

interface ChatMessageProps {
    role: "user" | "assistant";
    content: string;
    children?: React.ReactNode;
}

export function ChatMessage({ role, content, children }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={cn(
                "flex gap-3 w-full",
                isUser ? "flex-row-reverse" : "flex-row"
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                    isUser
                        ? "bg-primary/20 text-primary"
                        : "bg-white/10 text-white"
                )}
            >
                {isUser ? (
                    <User className="w-4 h-4" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
            </div>

            {/* Message Content */}
            <div
                className={cn(
                    "flex flex-col gap-2 max-w-[80%]",
                    isUser ? "items-end" : "items-start"
                )}
            >
                <div
                    className={cn(
                        "px-4 py-3 rounded-2xl text-sm",
                        isUser
                            ? "bg-primary text-black rounded-br-md"
                            : "bg-white/5 text-white/90 border border-white/10 rounded-bl-md"
                    )}
                >
                    {content}
                </div>

                {/* Embedded content (e.g., routine suggestion) */}
                {children && (
                    <div className="w-full">
                        {children}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
