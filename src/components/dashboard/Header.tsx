import { Bell } from "lucide-react";

export function DashboardHeader() {
    return (
        <header className="flex flex-col justify-between gap-4 pl-0 lg:flex-row lg:items-center">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                    Dashboard Overview
                </h1>
                <p className="mt-1 text-white/40">Statusbericht für Hausverwaltung Unit 04</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Bell className="cursor-pointer text-white/40 hover:text-white" />
                    <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#13b6ec]"></span>
                </div>
                <div className="mx-2 h-8 w-px bg-white/10"></div>
                <span className="text-sm font-medium text-white/60">
                    {new Date().toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                    })}
                </span>
            </div>
        </header>
    );
}
