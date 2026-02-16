"use client"

import { useState } from "react"
import { useTransition } from "react"
import { Task } from "@/types"
import { updateTask } from "@/app/actions"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface EditTaskFormProps {
    task: Task
    children: React.ReactNode
}

export function EditTaskForm({ task, children }: EditTaskFormProps) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        title: task.title,
        details: task.details,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        assigneeId: task.assigneeId || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSelectChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        startTransition(async () => {
            const result = await updateTask(task.id, {
                title: formData.title,
                details: formData.details,
                priority: formData.priority as Task["priority"],
                dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString(),
                assigneeId: formData.assigneeId || undefined
            })
            if (result.success) {
                setOpen(false)
            } else {
                alert(result.error)
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#000000] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Aufgabe bearbeiten</DialogTitle>
                    <DialogDescription>
                        Bearbeite die Details der Aufgabe hier. Klicke auf Speichern, wenn du fertig bist.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-white">Titel</Label>
                        <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="bg-[#1A1A1A] border-white/10 text-white"
                            required
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="details" className="text-white">Beschreibung</Label>
                        <Textarea
                            id="details"
                            name="details"
                            value={formData.details}
                            onChange={handleChange}
                            className="bg-[#1A1A1A] border-white/10 text-white min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="priority" className="text-white">Priorität</Label>
                            <Select
                                value={formData.priority}
                                onValueChange={(value) => handleSelectChange('priority', value)}
                            >
                                <SelectTrigger className="bg-[#1A1A1A] border-white/10 text-white">
                                    <SelectValue placeholder="Wähle Priorität" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                    <SelectItem value="high">Hoch</SelectItem>
                                    <SelectItem value="normal">Normal</SelectItem>
                                    <SelectItem value="low">Niedrig</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="dueDate" className="text-white">Fälligkeitsdatum</Label>
                            <Input
                                id="dueDate"
                                name="dueDate"
                                type="date"
                                value={formData.dueDate}
                                onChange={handleChange}
                                className="bg-[#1A1A1A] border-white/10 text-white block w-full"
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="assigneeId" className="text-white">Zugewiesen an (ID)</Label>
                        <Input
                            id="assigneeId"
                            name="assigneeId"
                            value={formData.assigneeId}
                            onChange={handleChange}
                            className="bg-[#1A1A1A] border-white/10 text-white"
                            placeholder="User ID (optional)"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending} className="bg-[#13B6EC] hover:bg-[#13B6EC]/80 text-black font-bold">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Speichern
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
