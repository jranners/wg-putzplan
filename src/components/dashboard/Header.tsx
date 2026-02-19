"use client";

import { Bell, Factory } from "lucide-react";
import { getWGData } from "@/app/actions";
import { useEffect, useState } from "react";

export function DashboardHeader({ title }: { title?: string }) {
    const [wgName, setWgName] = useState<string>("TidyUp");
    const [wgImage, setWgImage] = useState<string | null>(null);

    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        getWGData().then(res => {
            if (res.success && res.data.wg) {
                setWgName(res.data.wg.name);
                setWgImage(res.data.wg.image || null);
            }
        });
    }, []);

    return (
        <header className="flex flex-col justify-between gap-4 pl-0 lg:flex-row lg:items-center relative">
            <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-card border border-border overflow-hidden shrink-0 shadow-2xl flex items-center justify-center group transition-all hover:border-primary/50">
                    {wgImage ? (
                        <img src={wgImage} alt={wgName} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-primary bg-primary/5">
                            <Factory size={28} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase italic">
                        {wgName}
                    </h1>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] ml-0.5">
                        {title || "Zentrale Übersicht"}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="hidden md:flex flex-col items-end">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">System Status</span>
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Online
                    </span>
                </div>

                <div className="h-8 w-px bg-white/5 hidden md:block"></div>

                <div className="flex items-center gap-4 relative">
                    <div
                        className="relative group cursor-pointer"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell className={`transition-colors ${showNotifications ? 'text-primary' : 'text-white/40 group-hover:text-primary'}`} size={20} />
                        <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(19,182,236,0.5)]"></span>
                    </div>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <>
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowNotifications(false)}
                            />
                            <div className="absolute right-0 top-full mt-4 w-72 rounded-2xl bg-card border border-border shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Benachrichtigungen</h3>
                                <div className="py-8 flex flex-col items-center justify-center text-center">
                                    <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                        <Bell size={20} className="text-white/20" />
                                    </div>
                                    <p className="text-sm font-bold text-white/40">Keine neuen Meldungen</p>
                                    <p className="text-[10px] text-white/20 uppercase tracking-tighter mt-1">Dein System ist auf dem neuesten Stand</p>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="mx-2 h-8 w-px bg-white/10"></div>
                    <span className="text-xs font-black text-white/60 uppercase tracking-tighter">
                        {new Date().toLocaleDateString("de-DE", {
                            day: "2-digit",
                            month: "short",
                        })}
                    </span>
                </div>
            </div>
        </header>
    );
}
