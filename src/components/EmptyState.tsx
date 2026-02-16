import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-white/10 rounded-xl bg-white/5",
            className
        )}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
                <Icon className="h-6 w-6 text-white/40" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
            <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>
            {action}
        </div>
    );
}
