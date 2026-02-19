"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
    label: string;
    value?: string;
    onClick?: () => void;
    className?: string;
    icon?: React.ElementType; // Optional icon for the item itself
    variant?: "default" | "danger";
}

export function SettingsItem({
    label,
    value,
    onClick,
    className,
    icon: Icon,
    variant = "default"
}: SettingsItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex w-full items-center justify-between px-4 py-4 transition-all hover:bg-white/5 text-left active:scale-[0.99]",
                className
            )}
        >
            <div className="flex items-center gap-3">
                {Icon && (
                    <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-lg",
                        variant === "danger" ? "bg-red-500/10 text-red-500" : "bg-white/5 text-white/60"
                    )}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
                <span className={cn(
                    "text-sm font-medium",
                    variant === "danger" ? "text-red-500" : "text-white"
                )}>
                    {label}
                </span>
            </div>

            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-white/40">{value}</span>}
                <ChevronRight className="h-4 w-4 text-white/20" />
            </div>
        </button>
    );
}

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutItem() {
    return (
        <SettingsItem
            label="Abmelden"
            icon={LogOut}
            variant="danger"
            onClick={() => signOut({ callbackUrl: "/login" })}
        />
    );
}
