"use client";

import { useMemo, useState } from "react";
import { Task, User } from "@/types";
import { format, isToday, isTomorrow, addDays, startOfDay, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";

interface ScheduleViewProps {
    tasks: Task[];
    users: User[];
}

export function ScheduleView({ tasks, users }: ScheduleViewProps) {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Generate next 7 days
    const next7Days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
    }, []);

    const tasksForSelectedDate = useMemo(() => {
        return tasks.filter(task => isSameDay(new Date(task.dueDate), selectedDate));
    }, [tasks, selectedDate]);

    // Group tasks by date for the "Upcoming" overview if needed, but for "Swipe" we focus on selected day

    const getUserColor = (userId: string | null) => {
        if (!userId) return "bg-gray-500";
        // Deterministic color generation or map
        const colors = [
            "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-yellow-500",
            "bg-lime-500", "bg-green-500", "bg-emerald-500", "bg-teal-500",
            "bg-cyan-500", "bg-sky-500", "bg-blue-500", "bg-indigo-500",
            "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", "bg-pink-500",
            "bg-rose-500"
        ];
        let hash = 0;
        for (let i = 0; i < userId.length; i++) {
            hash = userId.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Date Navigation (Mobile Swipe-like experience via horizontal scroll) */}
            <div className="flex overflow-x-auto pb-4 gap-2 no-scrollbar snap-x">
                {next7Days.map((date) => {
                    const isSelected = isSameDay(date, selectedDate);
                    return (
                        <button
                            key={date.toISOString()}
                            onClick={() => setSelectedDate(date)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-xl border transition-all snap-center",
                                isSelected
                                    ? "bg-[#13b6ec] border-[#13b6ec] text-white shadow-[0_0_20px_rgba(19,182,236,0.3)]"
                                    : "bg-[#1A1A1A] border-white/5 text-white/40 hover:bg-white/5 hover:border-white/10"
                            )}
                        >
                            <span className="text-xs font-bold uppercase">{format(date, "EEE", { locale: de })}</span>
                            <span className="text-2xl font-bold">{format(date, "d")}</span>
                        </button>
                    );
                })}
            </div>

            {/* Daily View */}
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-xl font-bold text-white">
                        {isToday(selectedDate) ? "Heute" : isTomorrow(selectedDate) ? "Morgen" : format(selectedDate, "EEEE, d. MMMM", { locale: de })}
                    </h2>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/5">
                        {tasksForSelectedDate.length} Aufgaben
                    </span>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {tasksForSelectedDate.length > 0 ? (
                            tasksForSelectedDate.map((task) => {
                                const assignee = users.find(u => u.id === task.assigneeId);
                                return (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1F1F1F] p-4 group hover:border-[#13b6ec]/30 transition-all"
                                    >
                                        <div className={cn("absolute left-0 top-0 bottom-0 w-1", getUserColor(task.assigneeId))}></div>
                                        <div className="pl-3 flex items-start justify-between">
                                            <div>
                                                <h3 className="font-semibold text-white">{task.title}</h3>
                                                <p className="text-sm text-white/50 line-clamp-1">{task.details}</p>

                                                <div className="flex items-center gap-3 mt-3">
                                                    {assignee && (
                                                        <div className="flex items-center gap-1.5">
                                                            {assignee.avatarUrl ? (
                                                                <img src={assignee.avatarUrl} className="w-5 h-5 rounded-full" alt={assignee.name} />
                                                            ) : (
                                                                <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white/90", getUserColor(assignee.id))}>
                                                                    {assignee.name[0]}
                                                                </div>
                                                            )}
                                                            <span className="text-xs text-white/60">{assignee.name}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-1 text-xs text-white/40">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{format(new Date(task.dueDate), "HH:mm")}</span>
                                                        {/* Assuming dueDate has time, otherwise just show date or omit */}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    task.priority === 'high' ? "bg-red-500/20 text-red-500" :
                                                        task.priority === 'normal' ? "bg-blue-500/20 text-blue-500" : "bg-slate-500/20 text-slate-500"
                                                )}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 text-center"
                            >
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <CalendarIcon className="w-8 h-8 text-white/20" />
                                </div>
                                <h3 className="text-white font-medium">Nichts zu tun!</h3>
                                <p className="text-white/40 text-sm">Genieß den Tag.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
