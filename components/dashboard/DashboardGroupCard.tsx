import { Users } from "lucide-react";
import Link from "next/link";

interface DashboardGroupCardProps {
    group: {
        id: string;
        name: string;
        memberCount?: number;
    };
}

export function DashboardGroupCard({ group }: DashboardGroupCardProps) {
    return (
        <Link
            href={`/groups?id=${group.id}`}
            className="block p-4 rounded-xl bg-[#0f0f10] border border-zinc-800 hover:border-zinc-700 transition-colors group"
        >
            <div className="flex items-center justify-between mb-2">
                <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-lg font-bold text-zinc-300 group-hover:text-primary transition-colors">
                    {group.name.substring(0, 2).toUpperCase()}
                </div>
                {group.memberCount !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Users className="h-3.5 w-3.5" />
                        <span>{group.memberCount} members</span>
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                {group.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">View group activity</p>
        </Link>
    );
}
