"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Task, User } from "@/types";
import { toggleTaskStatus } from "@/app/actions";
import { useTransition, useState } from "react";
import { Check, Plus } from "lucide-react";
import { NewTaskModal } from "./NewTaskModal";

interface TaskListProps {
    tasks: Task[];
    users: User[];
}

export function TaskList({ tasks, users }: TaskListProps) {
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Helpers for mapping priority to styles
    const getPriorityStyle = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "bg-[#13b6ec]/20 text-[#13b6ec]";
            case "normal":
                return "bg-white/10 text-white/50";
            case "low":
                return "bg-slate-700 text-slate-300";
            default:
                return "bg-white/10 text-white/50";
        }
    };

    const getPriorityLabel = (priority: Task["priority"]) => {
        switch (priority) {
            case "high":
                return "Priorität Hoch";
            case "normal":
                return "Normal";
            case "low":
                return "Niedrig";
            default:
                return priority;
        }
    };

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        const today = new Date();
        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        if (isToday) return "Heute";
        return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short" });
    };

    const handleToggle = (taskId: string) => {
        startTransition(async () => {
            await toggleTaskStatus(taskId);
        });
    };

    return (
        <section className="rounded-lg border border-white/5 bg-[#1A1A1A] p-5 md:p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-white inline-flex items-center gap-2">
                        Deine nächsten Aufgaben
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                        className="text-xs font-bold uppercase bg-[#13b6ec]/10 text-[#13b6ec] border border-[#13b6ec]/20 hover:bg-[#13b6ec] hover:text-white transition-all flex items-center gap-1.5"
                    >
                        <Plus className="h-3 w-3" />
                        Neue Aufgabe
                    </Button>
                    <a
                        href="/tasks"
                        className="text-xs font-bold uppercase text-white/30 hover:underline hover:text-white"
                    >
                        Alle
                    </a>
                </div>
            </div>

            {/* Modal */}
            <NewTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                users={users}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tasks.map((task) => (
                    <div
                        key={task.id}
                        className="group rounded-lg border border-white/5 bg-black/60 p-5 transition-colors hover:border-[#13b6ec]/40"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <span
                                className={cn(
                                    "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                    getPriorityStyle(task.priority)
                                )}
                            >
                                {getPriorityLabel(task.priority)}
                            </span>
                            <span className="text-xs text-white/30">
                                {formatDate(task.dueDate)}
                            </span>
                        </div>
                        <h4 className="mb-1 text-base font-semibold text-white">
                            {task.title}
                        </h4>
                        <p className="mb-6 text-sm text-white/50">{task.details}</p>
                        <Button
                            variant="default"
                            onClick={() => handleToggle(task.id)}
                            disabled={isPending}
                            className="w-full border border-[#13b6ec] bg-transparent text-[#13b6ec] hover:bg-[#13b6ec] hover:text-white"
                        >
                            {isPending ? (
                                <span className="animate-pulse">Lädt...</span>
                            ) : (
                                <>
                                    <Check className="mr-2 h-4 w-4" /> Erledigt
                                </>
                            )}
                        </Button>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="col-span-full py-10 text-center text-white/40">
                        Keine offenen Aufgaben.
                    </div>
                )}
            </div>
        </section>
    );
}
