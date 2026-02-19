"use client";
import Link from "next/link";
import { Home, ClipboardList, ShoppingCart, Wallet, Menu, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MobileMenuDrawer } from "./MobileMenuDrawer";

export function MobileNav() {
    const pathname = usePathname();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#000000]/95 backdrop-blur-3xl pb-[env(safe-area-inset-bottom)] md:hidden">
                <div className="grid grid-cols-5 items-center h-[64px] relative">
                    <NavItem href="/" icon={Home} label="Home" isActive={pathname === "/"} />
                    <NavItem href="/tasks" icon={ClipboardList} label="Tasks" isActive={pathname === "/tasks"} />
                    <NavItem href="/expenses" icon={Wallet} label="Finanzen" isActive={pathname === "/expenses"} />
                    <NavItem href="/shopping" icon={ShoppingCart} label="Einkauf" isActive={pathname === "/shopping"} />
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center h-full transition-colors active:scale-95",
                            isDrawerOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Menu className="h-6 w-6" />
                        <span className="mt-1 text-[10px] font-bold uppercase tracking-normal">
                            Menu
                        </span>
                    </button>
                </div>
            </nav>

            <MobileMenuDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
            />
        </>
    );
}

function NavItem({ href, icon: Icon, label, isActive }: any) {
    return (
        <Link
            href={href}
            className={cn(
                "flex flex-col items-center justify-center h-full transition-colors active:scale-95",
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
