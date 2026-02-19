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
                        Dein Saldo
                    </p>
                    <h2 className={cn("text-3xl md:text-5xl font-bold tracking-tighter", finances.total >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {formatMoney(finances.total)}
                    </h2>
                    <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-white/50 text-sm font-medium">
                            <TrendingUp className="h-4 w-4" />
                            <span>{finances.total >= 0 ? "Guthaben" : "Schulden"}</span>
                        </div>
                        <div className="text-sm text-white/30">Persönliche Bilanz</div>
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
                                        <div className="flex gap-1">
                                            {debt.paypalMeHandle && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => window.open(`https://paypal.me/${debt.paypalMeHandle}/${Math.abs(debt.amount).toFixed(2)}`, '_blank')}
                                                    className="h-8 w-8 rounded-full border border-[#003087]/30 text-[#003087] hover:bg-[#003087]/10 bg-[#003087]/5"
                                                    title="Mit PayPal bezahlen"
                                                >
                                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.794-9.067 6.794h-2.14l-2.57 6.307c-.039.096-.134.155-.238.155H4.25c-.244 0-.423-.238-.364-.47l.149-.586.151-.587C4.249 18.004 4.343 17.9 4.49 17.9h1.79c.659 0 1.25-.426 1.4-1.127l2.83-13.376a.35.35 0 0 1 .33-.284h6.05c1.47 0 2.502.827 2.158 3.033-.188 1.206-.707 2.21-1.545 2.977-1.16 1.066-2.9 1.408-5.32 1.408h-.694a1.12 1.12 0 0 0-1.077 1.35l1.64 7.63c.092.428-.236.826-.676.826z" />
                                                    </svg>
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setSelectedDebt(debt)}
                                                className="h-8 w-8 rounded-full border border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                                                title="Als bezahlt markieren"
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </div>
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
