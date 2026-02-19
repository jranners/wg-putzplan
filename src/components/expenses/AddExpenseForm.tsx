"use client";

import { useTransition, useState, useEffect } from "react";
import { addExpense } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Plus, X, Users, Percent, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

// Mock users for split logic
const USERS = [
    { id: "1", name: "Du" },
    { id: "2", name: "Anna" },
    { id: "3", name: "Ben" },
];

type SplitType = "equal" | "percentage" | "exact";

export function AddExpenseForm() {
    const [isPending, startTransition] = useTransition();
    const [open, setOpen] = useState(false);

    // Form State
    const [amount, setAmount] = useState<string>("");
    const [splitType, setSplitType] = useState<SplitType>("equal");
    const [splitValues, setSplitValues] = useState<Record<string, number>>({});

    // Initialize split values when opening or changing type
    useEffect(() => {
        if (!open) return;
        const initial: Record<string, number> = {};
        USERS.forEach(u => initial[u.id] = 0);

        if (splitType === "equal" && amount) {
            const val = parseFloat(amount) / USERS.length;
            USERS.forEach(u => initial[u.id] = val);
        } else if (splitType === "percentage") {
            const val = 100 / USERS.length;
            USERS.forEach(u => initial[u.id] = val);
        } else if (splitType === "exact") {
            USERS.forEach(u => initial[u.id] = 0);
        }
        setSplitValues(initial);
    }, [open, splitType, amount]);

    const handleSplitChange = (userId: string, value: string) => {
        setSplitValues(prev => ({
            ...prev,
            [userId]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = async (formData: FormData) => {
        const title = formData.get("title") as string;
        const date = formData.get("date") as string;
        const category = formData.get("category") as any;
        const totalAmount = parseFloat(amount);

        if (!title || !totalAmount || !category || !date) return;

        // In a real app, we'd validate the split sums here

        startTransition(async () => {
            const result = await addExpense({
                title,
                amount: totalAmount,
                category,
                date: new Date(date).toISOString(),
                split: splitType,
            });

            if (result.success) {
                setOpen(false);
                setAmount("");
            } else {
                alert(result.error);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className="w-full h-14 text-lg gap-2 bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-white font-bold uppercase tracking-wide shadow-[0_0_20px_rgba(19,182,236,0.3)] hover:shadow-[0_0_30px_rgba(19,182,236,0.5)] transition-all"
                >
                    <Plus className="h-5 w-5" /> Neue Ausgabe erfassen
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[#1A1A1A] border-white/10 text-white p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 border-b border-white/10">
                    <DialogTitle className="text-xl font-bold tracking-tight text-white">Ausgabe hinzufügen</DialogTitle>
                </DialogHeader>

                <form action={handleSubmit} className="p-6 space-y-6">
                    {/* Main Fields */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Was?</Label>
                            <Input name="title" required placeholder="z.B. Wocheneinkauf" className="bg-black/40 border-white/10 text-white h-12 text-lg focus:border-[#13b6ec]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Wieviel?</Label>
                                <div className="relative">
                                    <Input
                                        name="amount"
                                        required
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="bg-black/40 border-white/10 text-white h-12 text-lg font-mono pl-8 focus:border-[#13b6ec]"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">€</span>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Wann?</Label>
                                <Input name="date" required type="date" defaultValue={new Date().toISOString().split('T')[0]} className="bg-black/40 border-white/10 text-white h-12 focus:border-[#13b6ec]" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-2 block">Kategorie</Label>
                            <Select name="category" defaultValue="groceries">
                                <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 focus:border-[#13b6ec]">
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

                    {/* Split Section */}
                    <div className="pt-4 border-t border-white/10">
                        <Label className="text-xs font-bold uppercase tracking-widest text-white/60 mb-4 block">Aufteilung</Label>

                        {/* Tabs */}
                        <div className="flex bg-black/40 p-1 rounded-lg mb-4">
                            {(["equal", "percentage", "exact"] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSplitType(type)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all",
                                        splitType === type ? "bg-[#13b6ec] text-white shadow-lg" : "text-white/40 hover:text-white"
                                    )}
                                >
                                    {type === "equal" && <Users className="h-3 w-3" />}
                                    {type === "percentage" && <Percent className="h-3 w-3" />}
                                    {type === "exact" && <Calculator className="h-3 w-3" />}
                                    {type === "equal" ? "Gleich" : type === "percentage" ? "%" : "Exakt"}
                                </button>
                            ))}
                        </div>

                        {/* Split Inputs */}
                        <div className="space-y-3 bg-black/20 p-4 rounded-lg">
                            {USERS.map(user => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white">{user.name}</span>
                                    <div className="flex items-center gap-2">
                                        {splitType === "equal" && (
                                            <span className="text-white/60 font-mono text-sm">
                                                {((parseFloat(amount || "0") / USERS.length) || 0).toFixed(2)} €
                                            </span>
                                        )}
                                        {splitType !== "equal" && (
                                            <Input
                                                type="number"
                                                className="w-20 h-8 bg-black/40 border-white/10 text-right font-mono text-sm text-white focus:border-[#13b6ec]"
                                                value={splitValues[user.id] || 0}
                                                onChange={(e) => handleSplitChange(user.id, e.target.value)}
                                            />
                                        )}
                                        {splitType === "percentage" && <span className="text-white/40 text-xs">%</span>}
                                        {splitType === "exact" && <span className="text-white/40 text-xs">€</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isPending} className="flex-1 h-12 bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-white font-bold uppercase tracking-wide">
                            {isPending ? "Speichern..." : "Speichern"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
