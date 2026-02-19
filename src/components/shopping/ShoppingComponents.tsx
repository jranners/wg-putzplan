"use client";

import { useTransition, useState } from "react";
import { addShoppingItem, toggleShoppingItem, deleteShoppingItem, addExpense } from "@/app/actions";
import { ShoppingItem, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Trash2, Plus, ShoppingCart, CreditCard, RotateCcw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ShoppingListProps {
    items: ShoppingItem[];
    users: User[];
    currentUserId: string;
}

export function ShoppingList({ items, users, currentUserId }: ShoppingListProps) {
    const [isPending, startTransition] = useTransition();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [itemToComplete, setItemToComplete] = useState<ShoppingItem | null>(null);

    const openItems = items.filter(i => !i.isBought);
    const boughtItems = items.filter(i => i.isBought);

    const handleSwipe = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, item: ShoppingItem) => {
        if (info.offset.x > 100) {
            setItemToComplete(item);
        } else if (info.offset.x < -100) {
            if (confirm("Wirklich löschen?")) {
                startTransition(() => {
                    const del = async () => await deleteShoppingItem(item.id);
                    del();
                });
            }
        }
    };

    const handleToggle = (id: string) => {
        startTransition(() => {
            const toggle = async () => await toggleShoppingItem(id);
            toggle();
        });
    };

    return (
        <div className="relative h-full min-h-[500px]">
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 z-50 h-14 w-14 rounded-full bg-[#13b6ec] text-white shadow-lg shadow-[#13b6ec]/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
            >
                <Plus className="h-8 w-8" />
            </button>

            <div className="space-y-4 pb-24">
                <AnimatePresence mode="popLayout">
                    {openItems.length > 0 ? (
                        openItems.map(item => (
                            <ShoppingItemCard
                                key={item.id}
                                item={item}
                                users={users}
                                onSwipe={(e, info) => handleSwipe(e, info, item)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                            <ShoppingCart className="h-16 w-16 mb-4 text-slate-600" />
                            <p className="text-xl font-bold">Alles erledigt! 😊</p>
                            <p className="text-sm">Füge neue Einkäufe hinzu.</p>
                        </div>
                    )}
                </AnimatePresence>

                {boughtItems.length > 0 && (
                    <div className="pt-8 border-t border-white/10">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Erledigt</h3>
                        <div className="space-y-2 opacity-50">
                            {boughtItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                                    <span className="line-through">{item.title}</span>
                                    <Button variant="ghost" size="sm" onClick={() => handleToggle(item.id)}>
                                        <RotateCcw className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AddItemModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {itemToComplete && (
                <CompleteItemModal
                    item={itemToComplete}
                    isOpen={!!itemToComplete}
                    onClose={() => setItemToComplete(null)}
                    currentUserId={currentUserId}
                />
            )}
        </div>
    );
}

function ShoppingItemCard({ item, users, onSwipe }: { item: ShoppingItem, users: User[], onSwipe: (e: any, info: PanInfo) => void }) {
    const addedByUser = users.find(u => u.id === item.addedBy);
    const assigneeUser = users.find(u => u.id === (item as any).assigneeId);

    return (
        <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={onSwipe}
            whileDrag={{ scale: 1.02, cursor: "grabbing" }}
            className="relative touch-pan-y"
        >
            <div className="absolute inset-y-0 left-0 w-full bg-emerald-500/20 rounded-xl flex items-center justify-start px-6">
                <Check className="text-emerald-500 h-6 w-6" />
            </div>
            <div className="absolute inset-y-0 right-0 w-full bg-rose-500/20 rounded-xl flex items-center justify-end px-6">
                <Trash2 className="text-rose-500 h-6 w-6" />
            </div>

            <div className="relative z-10 bg-[#1F1F1F] border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-white/40">Wer kauft?</span>
                        {assigneeUser ? (
                            <div className="flex items-center gap-1 bg-white/10 px-1.5 py-0.5 rounded-full">
                                {assigneeUser.avatarUrl && <img src={assigneeUser.avatarUrl} className="w-3 h-3 rounded-full" />}
                                <span className="text-xs font-semibold text-white/80">{assigneeUser.name}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-white/30 italic">Offen</span>
                        )}

                        {addedByUser && (
                            <span className="text-[10px] text-white/20 ml-2">Von: {addedByUser.name}</span>
                        )}
                    </div>
                </div>
                <div className="text-white/20">
                    <ChevronRight className="h-5 w-5" />
                </div>
            </div>
        </motion.div>
    )
}

function AddItemModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [title, setTitle] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            const add = async () => {
                await addShoppingItem(title);
                setTitle("");
                onClose();
            };
            add();
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black border-white/10 text-white top-[20%] translate-y-0">
                <DialogHeader>
                    <DialogTitle>Neuer Einkauf</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        autoFocus
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="z.B. Milch, Eier..."
                        className="bg-white/5 border-white/10 text-white text-lg py-6"
                    />
                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
                        <Button type="submit" disabled={!title} className="bg-[#13b6ec] text-white">Hinzufügen</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function CompleteItemModal({ item, isOpen, onClose, currentUserId }: { item: ShoppingItem, isOpen: boolean, onClose: () => void, currentUserId: string }) {
    const [cost, setCost] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleComplete = (withExpense: boolean) => {
        startTransition(() => {
            const complete = async () => {
                if (withExpense && cost) {
                    await addExpense({
                        title: item.title,
                        amount: parseFloat(cost.replace(',', '.')),
                        category: "groceries",
                        date: new Date().toISOString(),
                        payerId: currentUserId,
                        split: "equal"
                    });
                }
                await toggleShoppingItem(item.id);
                onClose();
            };
            complete();
        });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-black border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Einkauf erledigt</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <p className="text-white/60">Hast du <strong className="text-white">{item.title}</strong> gekauft?</p>

                    <div className="bg-white/5 p-4 rounded-lg space-y-3">
                        <label className="text-xs font-bold uppercase text-white/40">Kosten (Optional)</label>
                        <div className="relative">
                            <Input
                                type="number"
                                step="0.01"
                                value={cost}
                                onChange={e => setCost(e.target.value)}
                                placeholder="0.00"
                                className="pl-8 bg-black border-white/10 text-white"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">€</span>
                        </div>
                        <p className="text-[10px] text-white/30">Wenn du einen Betrag eingibst, wird dieser automatisch als Ausgabe an alle Mitbewohner geteilt.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            className="border-white/10 hover:bg-white/5"
                            onClick={() => handleComplete(false)}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Ohne Kosten
                        </Button>
                        <Button
                            className="bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-white"
                            disabled={!cost}
                            onClick={() => handleComplete(true)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Als Ausgabe buchen
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
