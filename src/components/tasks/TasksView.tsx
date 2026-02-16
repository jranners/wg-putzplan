"use client";

import { useState } from "react";
import { Task } from "@/types";
import { DetailedTaskList } from "./DetailedTaskList";
import { TaskCalendar } from "./TaskCalendar";
import { Button } from "@/components/ui/button";
import { LayoutList, Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TasksViewProps {
    openTasks: Task[];
    completedTasks: Task[];
}

type ViewType = "list" | "calendar";

export function TasksView({ openTasks, completedTasks }: TasksViewProps) {
    const [view, setView] = useState<ViewType>("list");

    return (
        <div className="space-y-6">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold tracking-tight text-white">Aufgaben</h1>
                    <p className="text-white/40">Behaltet den Überblick über anstehende Pflichten.</p>
                </div>

                <div className="flex items-center gap-2 bg-[#1A1A1A] p-1 rounded-lg border border-white/5">
                    <button
                        onClick={() => setView("list")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider",
                            view === "list"
                                ? "bg-[#13b6ec] text-white shadow-lg"
                                : "text-white/40 hover:text-white"
                        )}
                    >
                        <LayoutList className="h-4 w-4" />
                        <span className="hidden sm:inline">Liste</span>
                    </button>
                    <button
                        onClick={() => setView("calendar")}
                        className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-md transition-all text-xs font-bold uppercase tracking-wider",
                            view === "calendar"
                                ? "bg-[#13b6ec] text-white shadow-lg"
                                : "text-white/40 hover:text-white"
                        )}
                    >
                        <CalendarIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Kalender</span>
                    </button>
                </div>
            </header>

            {view === "list" ? (
                <>
                    {/* Open Tasks Section */}
                    <section>
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold tracking-tight text-white">
                            <span className="flex h-6 w-6 items-center justify-center rounded bg-[#13b6ec]/20 text-xs text-[#13b6ec]">
                                {openTasks.length}
                            </span>
                            Offen
                        </h2>
                        <DetailedTaskList tasks={openTasks} />
                    </section>

                    {/* Completed Tasks Section */}
                    {completedTasks.length > 0 && (
                        <section className="border-t border-white/5 pt-8">
                            <h2 className="mb-4 text-lg font-bold tracking-tight text-white/40">Erledigt (Letzte 30 Tage)</h2>
                            <DetailedTaskList tasks={completedTasks} showCompleted />
                        </section>
                    )}
                </>
            ) : (
                <TaskCalendar tasks={[...openTasks, ...completedTasks]} />
            )}
        </div>
    );
}
