"use client";
import Link from "next/link";
import { Home, ClipboardList, BarChart2, ShoppingCart, Wallet } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#000000]/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="grid grid-cols-5 items-center">
                <NavItem href="/" icon={Home} label="Home" isActive={pathname === "/"} />
                <NavItem href="/expenses" icon={Wallet} label="Finanzen" isActive={pathname === "/expenses"} />
                <NavItem href="/tasks" icon={ClipboardList} label="Tasks" isActive={pathname === "/tasks"} />
                <NavItem href="/shopping" icon={ShoppingCart} label="Einkauf" isActive={pathname === "/shopping"} />
                <NavItem href="/statistics" icon={BarChart2} label="Stats" isActive={pathname === "/statistics"} />
            </div>
        </nav>
    );
}

function NavItem({ href, icon: Icon, label, isActive }: any) {
    return (
        <Link
            href={href}
            className={cn(
                "flex min-h-[64px] flex-col items-center justify-center py-4 transition-colors",
                isActive ? "text-[#13b6ec]" : "text-[#A1A1A1] hover:text-white"
            )}
        >
            <Icon className="h-6 w-6" />
            <span className="mt-1 text-[10px] font-bold uppercase tracking-normal">
                {label}
            </span>
        </Link>
    );
}
