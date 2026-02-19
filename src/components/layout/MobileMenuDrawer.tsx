"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Settings, PieChart, LogOut, CalendarDays, Factory, User } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface MobileMenuDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-card border-t border-border p-6 pb-[env(safe-area-inset-bottom)] shadow-2xl md:hidden"
                        style={{ maxHeight: "85vh", overflowY: "auto" }}
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center mb-8" onClick={onClose}>
                            <div className="h-1.5 w-12 rounded-full bg-white/20" />
                        </div>

                        {/* Profile Section */}
                        <div className="mb-8 flex items-center gap-4 bg-background/40 p-4 rounded-2xl border border-border">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-primary-foreground font-bold text-xl overflow-hidden shadow-lg border-2 border-border">
                                {user?.image ? (
                                    <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{user?.name?.[0] || <User />}</span>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold truncate text-lg">{user?.name || "Benutzer"}</p>
                                <p className="text-white/40 text-xs truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => signOut({ callbackUrl: "/login" })}
                                className="p-3 text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-xl transition-colors"
                                aria-label="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>

                        {/* Menu Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <DrawerItem href="/statistics" icon={PieChart} label="Statistik" color="text-purple-400" bgColor="bg-purple-900/10" borderColor="border-purple-500/10" onItemClick={onClose} />
                            <DrawerItem href="/zeitplan" icon={CalendarDays} label="Zeitplan" color="text-orange-400" bgColor="bg-orange-900/10" borderColor="border-orange-500/10" onItemClick={onClose} />
                            <DrawerItem href="/settings" icon={Settings} label="Einstellungen" color="text-zinc-200" bgColor="bg-zinc-800/30" borderColor="border-border" onItemClick={onClose} />
                            <DrawerItem href="/management" icon={Factory} label="WG Management" color="text-primary" bgColor="bg-primary/10" borderColor="border-primary/20" onItemClick={onClose} />
                        </div>

                        {/* Version Info */}
                        <div className="text-center text-[10px] text-white/20 tracking-widest uppercase font-mono mb-2">
                            CoreOS v2.1 Mobile
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function DrawerItem({ href, icon: Icon, label, color, bgColor, borderColor, onItemClick }: any) {
    return (
        <Link
            href={href}
            onClick={onItemClick}
            className={cn(
                "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all active:scale-[0.98]",
                bgColor,
                borderColor
            )}
        >
            <Icon className={cn("h-8 w-8 mb-1", color)} />
            <span className="text-sm font-semibold text-white/90">{label}</span>
        </Link>
    )
}
