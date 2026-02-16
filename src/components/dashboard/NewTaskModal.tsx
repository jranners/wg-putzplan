"use client";

import * as React from "react";
import { X, Plus, Calendar, RotateCcw, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createTask } from "@/app/actions";
import { User, Task } from "@/types";

interface NewTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
}

export function NewTaskModal({ isOpen, onClose, users }: NewTaskModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [title, setTitle] = React.useState("");
    const [details, setDetails] = React.useState("");
    const [priority, setPriority] = React.useState<Task["priority"]>("normal");
    const [rotation, setRotation] = React.useState<NonNullable<Task["rotation"]>>("none");
    const [dueDate, setDueDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [assigneeId, setAssigneeId] = React.useState<string>("");

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const result = await createTask({
                title,
                details,
                priority,
                rotation,
                dueDate: new Date(dueDate).toISOString(),
                assigneeId: assigneeId || undefined,
            });

            if (!result.success) {
                alert(result.error);
                return;
            }

            onClose();
            // Reset form
            setTitle("");
            setDetails("");
            setPriority("normal");
            setRotation("none");
            setAssigneeId("");
        } catch (error) {
            console.error("Failed to create task:", error);
            alert("Ein technischer Fehler ist aufgetreten.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg border-white/10 bg-[#000000] p-0 text-white shadow-2xl overflow-hidden">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[#13b6ec]/10 blur-3xl"></div>

                <DialogHeader className="p-6 relative z-10 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold tracking-tight">Neue Aufgabe erstellen</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreate} className="p-6 space-y-6 relative z-10">
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Titel</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors"
                                placeholder="z.B. Küche putzen"
                            />
                        </div>

                        {/* Details */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Details</label>
                            <textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors min-h-[100px]"
                                placeholder="Was genau ist zu tun?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Priorität</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors appearance-none"
                                >
                                    <option value="low" className="bg-black">Niedrig</option>
                                    <option value="normal" className="bg-black">Normal</option>
                                    <option value="high" className="bg-black">Hoch</option>
                                </select>
                            </div>

                            {/* Assignee */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Zuweisen an</label>
                                <select
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors appearance-none"
                                >
                                    <option value="" className="bg-black">Nicht zugewiesen</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id} className="bg-black">{user.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Fällig am</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Rotation */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Wiederholung</label>
                                <select
                                    value={rotation}
                                    onChange={(e) => setRotation(e.target.value as any)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-[#13b6ec]/50 transition-colors appearance-none"
                                >
                                    <option value="none" className="bg-black">Keine</option>
                                    <option value="daily" className="bg-black">Täglich</option>
                                    <option value="weekly" className="bg-black">Wöchentlich</option>
                                    <option value="biweekly" className="bg-black">Alle 2 Wochen</option>
                                    <option value="monthly" className="bg-black">Monatlich</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex gap-3">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 border border-white/10 hover:bg-white/5 text-white/60"
                        >
                            Abbrechen
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || !title}
                            className="flex-2 bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-white font-bold px-8"
                        >
                            {isSubmitting ? "Wird erstellt..." : "Aufgabe erstellen"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
