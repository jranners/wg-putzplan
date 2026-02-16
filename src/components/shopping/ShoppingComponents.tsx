"use client";

import { useTransition, useState } from "react";
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem } from "@/app/actions";
import { ShoppingItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export function AddShoppingItem() {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        startTransition(async () => {
            await addShoppingItem(title);
            setTitle("");
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Was muss eingekauft werden?"
                className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-primary"
            />
            <Button
                type="submit"
                disabled={isPending || !title.trim()}
                className="bg-primary hover:bg-primary/90 text-slate-900 font-semibold"
            >
                <Plus className="h-5 w-5 mr-1" />
                Add
            </Button>
        </form>
    );
}

interface ShoppingListProps {
    items: ShoppingItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = (id: string) => {
        startTransition(async () => {
            await toggleShoppingItem(id);
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Wirklich löschen?")) {
            startTransition(async () => {
                await deleteShoppingItem(id);
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
                <p>Die Einkaufsliste ist leer.</p>
            </div>
        );
    }

    const boughtItems = items.filter(i => i.isBought);
    const openItems = items.filter(i => !i.isBought);

    return (
        <div className="space-y-6">
            {/* Open Items */}
            <div className="space-y-2">
                {openItems.map((item) => (
                    <div
                        key={item.id}
                        className="group flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handleToggle(item.id)}
                                disabled={isPending}
                                className="flex h-6 w-6 items-center justify-center rounded border-2 border-slate-500 hover:border-primary transition-colors"
                            >
                                {isPending ? null : null}
                            </button>
                            <div>
                                <p className="font-medium text-white">{item.title}</p>
                                <p className="text-xs text-slate-500">
                                    Hinzugefügt am {format(new Date(item.createdAt), "dd.MM.", { locale: de })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(item.id)}
                            disabled={isPending}
                            className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-2"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Bought Items */}
            {boughtItems.length > 0 && (
                <div className="pt-4">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Erledigt</h3>
                    <div className="space-y-2 opacity-60">
                        {boughtItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-transparent"
                            >
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleToggle(item.id)}
                                        disabled={isPending}
                                        className="flex h-6 w-6 items-center justify-center rounded border-2 border-primary bg-primary text-slate-900"
                                    >
                                        <Check className="h-4 w-4 stroke-[3]" />
                                    </button>
                                    <p className="font-medium text-slate-400 line-through decoration-slate-600">
                                        {item.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isPending}
                                    className="text-slate-600 hover:text-red-400 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
