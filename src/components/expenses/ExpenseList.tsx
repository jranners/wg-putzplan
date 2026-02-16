"use client";

import { Expense } from "@/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useTransition, useState } from "react";
import { deleteExpense, updateExpense } from "@/app/actions";
import {
    Home,
    Zap,
    ShoppingCart,
    Wrench,
    Banknote,
    Pencil,
    Trash2,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface ExpenseListProps {
    expenses: Expense[];
}

export function ExpenseList({ expenses }: ExpenseListProps) {
    const [isPending, startTransition] = useTransition();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editAmount, setEditAmount] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editDate, setEditDate] = useState("");

    const openEdit = (expense: Expense) => {
        setEditTitle(expense.title);
        setEditAmount(expense.amount.toString());
        setEditCategory(expense.category);
        setEditDate(new Date(expense.date).toISOString().split("T")[0]);
        setEditingExpense(expense);
    };

    const handleDelete = (id: string) => {
        setDeletingId(id);
        startTransition(async () => {
            const result = await deleteExpense(id);
            if (!result.success) {
                alert(result.error);
            }
            setDeletingId(null);
        });
    };

    const handleUpdate = () => {
        if (!editingExpense) return;
        startTransition(async () => {
            const result = await updateExpense(editingExpense.id, {
                title: editTitle,
                amount: parseFloat(editAmount),
                category: editCategory as Expense["category"],
                date: new Date(editDate).toISOString(),
            });
            if (result.success) {
                setEditingExpense(null);
            } else {
                alert(result.error);
            }
        });
    };

    const getCategoryStyles = (category: Expense["category"]) => {
        switch (category) {
            case "rent":
                return { icon: Home, color: "text-[#13b6ec]", bg: "bg-[#13b6ec]/10" };
            case "utilities":
                return { icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" };
            case "groceries":
                return { icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500/10" };
            case "maintenance":
                return { icon: Wrench, color: "text-orange-500", bg: "bg-orange-500/10" };
            default:
                return { icon: Banknote, color: "text-white/40", bg: "bg-white/5" };
        }
    };

    const getCategoryLabel = (category: Expense["category"]) => {
        const labels: Record<string, string> = {
            rent: "Miete",
            utilities: "Nebenkosten",
            groceries: "Einkauf",
            maintenance: "Reparatur",
            other: "Sonstiges",
        };
        return labels[category] || category;
    };

    return (
        <>
            <div className="rounded-lg border border-white/5 bg-[#1A1A1A]">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold tracking-tight text-white">Letzte Ausgaben</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {expenses.length === 0 ? (
                        <div className="p-6">
                            <EmptyState
                                icon={ShoppingCart}
                                title="Keine Ausgaben"
                                description="Es wurden noch keine Ausgaben für diesen Monat eingetragen."
                            />
                        </div>
                    ) : (
                        expenses.map((expense) => {
                            const { icon: Icon, color, bg } = getCategoryStyles(expense.category);
                            const isDeleting = deletingId === expense.id;
                            return (
                                <div
                                    key={expense.id}
                                    className={cn(
                                        "group flex items-center justify-between p-4 hover:bg-white/5 transition-all",
                                        isDeleting && "opacity-50"
                                    )}
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg", bg)}>
                                            <Icon className={cn("h-5 w-5", color)} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white truncate">{expense.title}</p>
                                            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white/40">
                                                <span className="font-bold">{format(new Date(expense.date), "dd. MMM yyyy", { locale: de })}</span>
                                                <span>•</span>
                                                <span>{getCategoryLabel(expense.category)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {/* Edit & Delete appear on hover */}
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(expense)}
                                                className="p-2 rounded-lg hover:bg-[#13b6ec]/10 text-white/40 hover:text-[#13b6ec] transition-colors"
                                                title="Bearbeiten"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(expense.id)}
                                                disabled={isDeleting}
                                                className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-500 transition-colors"
                                                title="Löschen"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white text-lg">
                                                {new Intl.NumberFormat("de-DE", {
                                                    style: "currency",
                                                    currency: "EUR",
                                                }).format(expense.amount)}
                                            </p>
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                                                {expense.payerId === "1" ? "Du hast bezahlt" : "Jemand anderes"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Edit Expense Dialog */}
            <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
                <DialogContent className="sm:max-w-[500px] bg-[#1A1A1A] border-white/10 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Ausgabe bearbeiten</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Was?</Label>
                            <Input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="bg-black/40 border-white/10 text-white h-12 focus:border-[#13b6ec]"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Betrag</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={editAmount}
                                    onChange={(e) => setEditAmount(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white h-12 font-mono focus:border-[#13b6ec]"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Datum</Label>
                                <Input
                                    type="date"
                                    value={editDate}
                                    onChange={(e) => setEditDate(e.target.value)}
                                    className="bg-black/40 border-white/10 text-white h-12 focus:border-[#13b6ec]"
                                />
                            </div>
                        </div>
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Kategorie</Label>
                            <Select value={editCategory} onValueChange={setEditCategory}>
                                <SelectTrigger className="bg-black/40 border-white/10 text-white h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1A1A1A] border-white/10 text-white">
                                    <SelectItem value="groceries">🛒 Einkauf</SelectItem>
                                    <SelectItem value="rent">🏠 Miete</SelectItem>
                                    <SelectItem value="utilities">⚡ Nebenkosten</SelectItem>
                                    <SelectItem value="maintenance">🔧 Reparatur</SelectItem>
                                    <SelectItem value="other">📦 Sonstiges</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleUpdate}
                            disabled={isPending}
                            className="bg-[#13b6ec] hover:bg-[#13b6ec]/80 text-black font-bold"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Speichern
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
