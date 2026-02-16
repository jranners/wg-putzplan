"use client";

import { useTransition } from "react";
import { toggleTaskStatus } from "@/app/actions";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Check, Clock, Calendar, Pencil } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { EditTaskForm } from "./EditTaskForm";

interface TaskListProps {
    tasks: Task[];
    showCompleted?: boolean;
}

export function DetailedTaskList({ tasks, showCompleted = false }: TaskListProps) {
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
            {tasks.map((task) => (
                <div
                    key={task.id}
                    className={cn(
                        "group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border transition-all",
                        task.isDone
                            ? "bg-black/40 border-white/5 opacity-50"
                            : "bg-[#1A1A1A] border-white/5 hover:border-[#13b6ec]/40"
                    )}
                >
                    <div className="flex items-start gap-4 mb-3 sm:mb-0">
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

                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <EditTaskForm task={task}>
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
                            <p className="text-sm text-white/50 mb-2">{task.details}</p>


                            <div className="flex items-center gap-4 text-xs text-white/40 font-medium uppercase tracking-wider">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{format(new Date(task.dueDate), "dd. MMM", { locale: de })}</span>
                                </div>
                                {task.assigneeId && (
                                    <div className="flex items-center gap-1">
                                        <div className="h-4 w-4 rounded-full bg-white/10" />
                                        <span>User {task.assigneeId}</span>
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
                            className="hidden sm:flex border border-white/10 text-white hover:bg-[#13b6ec] hover:text-white"
                        >
                            Erledigt
                        </Button>
                    )}
                </div>
            ))}
        </div>
    );
}
