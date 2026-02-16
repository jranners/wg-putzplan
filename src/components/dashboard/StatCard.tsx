"use client";

import { TrendingUp, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardData, settleDebt } from "@/app/actions";
import { useState } from "react";
import { SettleUpModal } from "@/components/expenses/SettleUpModal";

interface FinanceWidgetProps {
    finances: DashboardData["finances"];
    debts: DashboardData["debts"];
}

export function FinanceWidget({ finances, debts }: FinanceWidgetProps) {
    const [selectedDebt, setSelectedDebt] = useState<DashboardData["debts"][0] | null>(null);

    // Format currency helper
    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat("de-DE", {
            style: "currency",
            currency: "EUR",
        }).format(amount);
    };

    const handleSettle = async (amount: number) => {
        if (!selectedDebt) return;
        await settleDebt(selectedDebt.userId, amount);
        setSelectedDebt(null);
    };

    return (
        <section className="relative overflow-hidden rounded-lg border border-white/5 bg-[#1A1A1A] p-4 md:p-6 lg:p-8 h-full flex flex-col">
            <div className="absolute -mr-32 -mt-32 right-0 top-0 h-64 w-64 rounded-full bg-[#13b6ec]/5 blur-3xl"></div>
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-end mb-8">
                <div>
                    <p className="mb-2 text-sm font-semibold tracking-widest text-white/40 uppercase">
                        Gesamt-Saldo
                    </p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-white">
                        {formatMoney(finances.total)}
                    </h2>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>Aktiv</span>
                        </div>
                        <div className="text-sm text-white/30">WG-Kasse</div>
                    </div>
                </div>
                <Button className="flex items-center gap-2 rounded-lg bg-[#13b6ec] px-6 py-3 font-bold text-white transition-all hover:bg-[#13b6ec]/90 active:scale-95">
                    <Plus className="h-4 w-4" />
                    Ausgabe
                </Button>
            </div>

            {/* Debt List Section */}
            <div className="relative z-10 flex-1 space-y-4 mb-8">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Offene Posten</p>
                <div className="space-y-2">
                    {debts.length > 0 ? (
                        debts.map(debt => (
                            <div key={debt.userId} className="flex items-center justify-between rounded-md bg-white/5 p-3 border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                                        {debt.userName.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{debt.userName}</p>
                                        <p className={cn("text-[10px] font-bold uppercase", debt.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                                            {debt.amount > 0 ? "Schuldet dir" : "Du schuldest"}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <span className={cn("text-sm font-bold", debt.amount > 0 ? "text-emerald-400" : "text-rose-400")}>
                                        {formatMoney(Math.abs(debt.amount))}
                                    </span>
                                    {debt.amount < 0 && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setSelectedDebt(debt)}
                                            className="h-8 w-8 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                                        >
                                            <ArrowRight className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-xs text-white/30 italic">Keine offenen Schulden.</p>
                    )}
                </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 mt-auto">
                <StatItem label="Einnahmen" value={formatMoney(finances.income)} />
                <StatItem label="Ausgaben" value={formatMoney(finances.fixed + finances.maintenance)} />
                <StatItem
                    label="Puffer"
                    value={formatMoney(finances.buffer)}
                    valueClassName="text-[#13b6ec]"
                />
                <StatItem
                    label="WG-Status"
                    value="Gedeckt"
                    valueClassName="text-emerald-400"
                />
            </div>

            {selectedDebt && (
                <SettleUpModal
                    isOpen={!!selectedDebt}
                    onClose={() => setSelectedDebt(null)}
                    debtorName={selectedDebt.userName}
                    amount={selectedDebt.amount}
                    onSettle={handleSettle}
                />
            )}
        </section>
    );
}

function StatItem({
    label,
    value,
    valueClassName,
}: {
    label: string;
    value: string | number;
    valueClassName?: string;
}) {
    return (
        <div>
            <p className="mb-1 text-[10px] font-bold uppercase text-white/40">
                {label}
            </p>
            <p className={cn("text-lg font-semibold text-white", valueClassName)}>
                {value}
            </p>
        </div>
    );
}
