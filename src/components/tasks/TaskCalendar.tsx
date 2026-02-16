"use client";

import { useState } from "react";
import { Task } from "@/types";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TaskCalendarProps {
    tasks: Task[];
}

export function TaskCalendar({ tasks }: TaskCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: de });
    const endDate = endOfWeek(monthEnd, { locale: de });

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const weekDays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

    const getTasksForDay = (date: Date) => {
        return tasks.filter(task => isSameDay(new Date(task.dueDate), date));
    };

    return (
        <div className="rounded-xl border border-white/5 bg-[#1A1A1A] overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
                <h2 className="text-xl font-bold tracking-tight text-white">
                    {format(currentMonth, "MMMM yyyy", { locale: de })}
                </h2>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="text-white hover:bg-white/5">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="text-white hover:bg-white/5">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-white/5 bg-black/20">
                {weekDays.map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold uppercase tracking-widest text-white/40">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {calendarDays.map((day, dayIdx) => {
                    const dayTasks = getTasksForDay(day);
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "min-h-[120px] p-3 border-b border-r border-white/5 relative group transition-colors",
                                isCurrentMonth ? "bg-transparent" : "bg-black/20",
                                isToday(day) && "bg-[#13b6ec]/5"
                            )}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className={cn(
                                    "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                                    isToday(day)
                                        ? "bg-[#13b6ec] text-white"
                                        : isCurrentMonth ? "text-white" : "text-white/20"
                                )}>
                                    {format(day, "d")}
                                </span>
                            </div>

                            <div className="space-y-1.5">
                                {dayTasks.map(task => (
                                    <div
                                        key={task.id}
                                        className={cn(
                                            "text-[10px] px-2 py-1 rounded border border-l-2 truncate font-medium flex items-center gap-1.5",
                                            task.isDone
                                                ? "bg-white/5 border-white/10 border-l-white/20 text-white/30 line-through"
                                                : "bg-[#13b6ec]/10 border-[#13b6ec]/20 border-l-[#13b6ec] text-white hover:bg-[#13b6ec]/20 cursor-pointer"
                                        )}
                                        title={task.title}
                                    >
                                        <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", task.isDone ? "bg-white/20" : "bg-[#13b6ec]")} />
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
