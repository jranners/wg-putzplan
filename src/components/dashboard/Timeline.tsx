"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Timeline() {
    // Mock data for the timeline to match the prototype visually
    const days = [
        { day: "MO", date: "14", active: false },
        { day: "DI", date: "15", active: true },
        { day: "MI", date: "16", active: false },
        { day: "DO", date: "17", active: false },
        { day: "FR", date: "18", active: false },
        { day: "SA", date: "19", active: false },
        { day: "SO", date: "20", active: false },
        { day: "MO", date: "21", active: false },
    ];

    return (
        <section className="lg:col-span-12 rounded-lg border border-white/5 bg-[#1A1A1A] p-6">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-widest text-white/40">
                    Zeitplan
                </h3>
                <div className="flex gap-2">
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 hover:bg-white/5 text-white">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded border border-white/10 hover:bg-white/5 text-white">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                {days.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            "flex-shrink-0 w-24 p-4 rounded-lg text-center border transition-all",
                            item.active
                                ? "bg-[#13b6ec] text-white border-[#13b6ec]"
                                : "bg-black/40 border-white/5 text-white"
                        )}
                    >
                        <p
                            className={cn(
                                "text-xs uppercase font-bold",
                                item.active ? "text-white/70" : "text-white/30"
                            )}
                        >
                            {item.day}
                        </p>
                        <p className="text-xl font-bold mt-1">{item.date}</p>
                        {item.active && (
                            <div className="w-1 h-1 bg-white rounded-full mx-auto mt-2"></div>
                        )}
                        {!item.active && (index === 0 || index === 3) && ( // Mock dots for visual parity
                            <div className="w-1 h-1 bg-[#13b6ec] rounded-full mx-auto mt-2"></div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
