"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    Wallet,
    ClipboardList,
    CalendarDays,
    Settings,
    ShoppingCart,
    PieChart,
    Factory,
} from "lucide-react";

const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Finanzen", href: "/expenses", icon: Wallet },
    { name: "Aufgaben", href: "/tasks", icon: ClipboardList },
    { name: "Zeitplan", href: "/zeitplan", icon: CalendarDays },
    { name: "Einkaufen", href: "/shopping", icon: ShoppingCart },
    { name: "Statistik", href: "/statistics", icon: PieChart },
    { name: "Management", href: "/management", icon: Settings },
];

interface SidebarProps {
    className?: string;
}

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className={cn("hidden w-64 flex-col border-r border-white/5 bg-[#1A1A1A] transition-all duration-300 md:flex", className)}>
            {/* Logo Section */}
            <div className="mb-8 flex items-center gap-3 p-6">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-[#13b6ec]">
                    <Factory className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">
                    CORE<span className="text-[#13b6ec]">OS</span>
                </span>
            </div>

            <nav className="flex-1 space-y-2 px-4">
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 rounded-lg px-4 py-3 transition-colors",
                                isActive
                                    ? "bg-[#13b6ec]/10 border border-[#13b6ec]/20 text-[#13b6ec]"
                                    : "text-white/50 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon
                                className={cn(
                                    "h-5 w-5",
                                    isActive ? "text-[#13b6ec]" : "text-current"
                                )}
                            />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Profile bar with Settings gear */}
            <div className="border-t border-white/5 p-4">
                <div className="flex items-center gap-3 rounded-lg bg-black/40 p-2">
                    <div className="h-8 w-8 rounded-full bg-slate-700"></div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-xs font-semibold text-white">M. Schmidt</p>
                        <p className="truncate text-[10px] text-white/40">Administrator</p>
                    </div>
                    <Link
                        href="/settings"
                        className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                            pathname === "/settings"
                                ? "bg-[#13b6ec]/20 text-[#13b6ec]"
                                : "text-white/30 hover:bg-white/10 hover:text-white"
                        )}
                    >
                        <PieChart className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </aside>
    );
}
