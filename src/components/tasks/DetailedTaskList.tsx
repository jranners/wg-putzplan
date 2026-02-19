"use client";

import { useTransition } from "react";
import { toggleTaskStatus, UserData } from "@/app/actions";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Check, Clock, Calendar, Pencil, AlertCircle } from "lucide-react";
import { format, differenceInDays, isPast, isSameDay } from "date-fns";
import { de } from "date-fns/locale";
import { EditTaskForm } from "./EditTaskForm";

interface TaskListProps {
    tasks: Task[];
    showCompleted?: boolean;
    users: UserData[];
}

export function DetailedTaskList({ tasks, showCompleted = false, users }: TaskListProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (id: string) => {
        startTransition(async () => {
            await toggleTaskStatus(id);
        });
    };

    const getPriorityStyle = (priority: Task["priority"]) => {
        switch (priority) {
            case "high": return "text-[#13b6ec] bg-[#13b6ec]/10 border-[#13b6ec]/20";
            case "normal": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
            case "low": return "text-white/40 bg-white/5 border-white/10";
            default: return "text-white/40";
        }
    };

    const getAssignee = (assigneeId: string | null) => {
        if (!assigneeId) return null;
        return users.find(u => u.id === assigneeId);
    };

    const getDueStatus = (dueDate: string) => {
        const date = new Date(dueDate);
        const today = new Date();

        if (isSameDay(date, today)) {
            return { text: "Heute fällig", color: "text-amber-400" };
        }

        if (isPast(date)) {
            const days = differenceInDays(today, date);
            return { text: `Seit ${days} Tagen überfällig`, color: "text-rose-500 font-bold" };
        }

        const days = differenceInDays(date, today);
        return { text: `In ${days} Tagen`, color: "text-white/40" };
    };

    if (tasks.length === 0) {
        return (
            <div className="py-6">
                <EmptyState
                    icon={Check}
                    title={showCompleted ? "Keine erledigten Aufgaben" : "Alles erledigt! 🎉"}
                    description={showCompleted ? "Erledigte Aufgaben erscheinen hier." : "Du hast alle offenen Aufgaben erledigt. Gönn dir eine Pause!"}
                />
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {tasks.map((task) => {
                const assignee = getAssignee(task.assigneeId);
                const dueStatus = getDueStatus(task.dueDate);

                return (
                    <div
                        key={task.id}
                        className={cn(
                            "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all",
                            task.isDone
                                ? "bg-black/40 border-white/5 opacity-50"
                                : "bg-[#1A1A1A] border-white/5 hover:border-[#13b6ec]/40"
                        )}
                    >
                        <div className="flex items-start gap-4 mb-3 sm:mb-0 w-full">
                            <button
                                onClick={() => handleToggle(task.id)}
                                disabled={isPending}
                                className={cn(
                                    "flex-shrink-0 flex h-6 w-6 mt-1 items-center justify-center rounded border transition-colors",
                                    task.isDone
                                        ? "bg-[#13b6ec] border-[#13b6ec] text-black"
                                        : "border-white/20 hover:border-[#13b6ec] bg-transparent"
                                )}
                            >
                                {(task.isDone || isPending) && <Check className="h-4 w-4 stroke-[3]" />}
                            </button>

                            <div className="flex-1 w-full">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <EditTaskForm task={task} users={users}>
                                            <button className="group/title flex items-center gap-2 hover:text-[#13b6ec] transition-colors text-left">
                                                <h4 className={cn(
                                                    "font-semibold text-base",
                                                    task.isDone ? "text-white/40 line-through" : "text-white"
                                                )}>
                                                    {task.title}
                                                </h4>
                                                <Pencil className="h-3 w-3 opacity-0 group-hover/title:opacity-100 transition-opacity text-[#13b6ec]" />
                                            </button>
                                        </EditTaskForm>
                                        <span className={cn(
                                            "text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border tracking-wider",
                                            getPriorityStyle(task.priority)
                                        )}>
                                            {task.priority === 'high' ? 'Hoch' : task.priority === 'normal' ? 'Normal' : 'Niedrig'}
                                        </span>
                                    </div>

                                    {/* Assignee Avatar (Mobile Right / Desktop Inline) */}
                                    {assignee && (
                                        <div className="hidden sm:flex items-center gap-2 ml-4">
                                            <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                                                {assignee.avatarUrl ? (
                                                    <img src={assignee.avatarUrl} alt={assignee.name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    assignee.name.charAt(0)
                                                )}
                                            </div>
                                            <span className="text-xs text-white/50">{assignee.name}</span>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-white/50 mb-2 truncate max-w-[80%]">{task.details}</p>

                                <div className="flex items-center gap-4 text-xs text-white/40 font-medium uppercase tracking-wider">
                                    <div className={cn("flex items-center gap-1", !task.isDone && dueStatus.color)}>
                                        {task.isDone ? <Check className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                        <span>
                                            {task.isDone
                                                ? `Erledigt am ${task.lastCompleted ? format(new Date(task.lastCompleted), "dd. MMM", { locale: de }) : "Unbekannt"}`
                                                : dueStatus.text
                                            }
                                        </span>
                                    </div>

                                    {/* Mobile Assignee */}
                                    {assignee && (
                                        <div className="flex sm:hidden items-center gap-1">
                                            <div className="h-4 w-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[9px] font-bold border border-emerald-500/30">
                                                {assignee.avatarUrl ? (
                                                    <img src={assignee.avatarUrl} alt={assignee.name} className="h-full w-full rounded-full object-cover" />
                                                ) : (
                                                    assignee.name.charAt(0)
                                                )}
                                            </div>
                                            <span>{assignee.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!task.isDone && (
                            <Button
                                variant="ghost"
                                onClick={() => handleToggle(task.id)}
                                disabled={isPending}
                                className="hidden sm:flex border border-white/10 text-white hover:bg-[#13b6ec] hover:text-white ml-4"
                            >
                                Erledigt
                            </Button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
