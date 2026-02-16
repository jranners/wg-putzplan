"use client";

import { settleDebt } from "@/app/actions";
import { Debt, User } from "@/types";
import { useState } from "react";
import { SettleUpModal } from "@/components/expenses/SettleUpModal";
import { User as UserIcon, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface DebtListProps {
    debts: Debt[];
    allUsers: User[];
}

export function DebtList({ debts, allUsers }: DebtListProps) {
    const [settleUpUserId, setSettleUpUserId] = useState<string | null>(null);

    const iOwe = debts.filter((d) => d.amount < 0);
    const owesMe = debts.filter((d) => d.amount > 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(Math.abs(amount));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Schulden mir — NOT clickable (you can't settle someone else's debt to you) */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/60">Schulden mir</h3>
                {owesMe.length === 0 ? (
                    <div className="p-6 rounded-lg border border-white/5 bg-[#1A1A1A] text-center text-white/40">
                        Niemand schuldet dir etwas.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {owesMe.map((debt) => (
                            <div
                                key={debt.userId}
                                className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-[#1A1A1A] transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-[#13B6EC]/10 flex items-center justify-center border border-[#13B6EC]/20 text-[#13B6EC] overflow-hidden">
                                        {debt.avatarUrl ? <img src={debt.avatarUrl} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">{debt.userName}</p>
                                        <p className="text-xs text-white/40 flex items-center gap-1">
                                            <ArrowDownLeft className="h-3 w-3 text-emerald-500" />
                                            Schuldet dir
                                        </p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-emerald-400 whitespace-nowrap">
                                    +{formatCurrency(debt.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Ich schulde — clickable, opens Settle Up */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/60">Ich schulde</h3>
                {iOwe.length === 0 ? (
                    <div className="p-6 rounded-lg border border-white/5 bg-[#1A1A1A] text-center text-white/40">
                        Du schuldest niemandem etwas.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {iOwe.map((debt) => (
                            <div
                                key={debt.userId}
                                onClick={() => setSettleUpUserId(debt.userId)}
                                className="flex items-center justify-between p-4 rounded-lg border border-white/5 bg-[#1A1A1A] hover:bg-[#1A1A1A]/80 hover:border-red-500/20 cursor-pointer transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 min-w-[2.5rem] rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 text-red-500 overflow-hidden">
                                        {debt.avatarUrl ? <img src={debt.avatarUrl} className="h-full w-full object-cover" /> : <UserIcon className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <p className="font-medium text-white group-hover:text-red-400 transition-colors">{debt.userName}</p>
                                        <p className="text-xs text-white/40 flex items-center gap-1">
                                            <ArrowUpRight className="h-3 w-3 text-red-500" />
                                            Jetzt ausgleichen
                                        </p>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-red-400 whitespace-nowrap">
                                    -{formatCurrency(debt.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {settleUpUserId && (
                <SettleUpModal
                    isOpen={!!settleUpUserId}
                    onClose={() => setSettleUpUserId(null)}
                    debtorName={debts.find(d => d.userId === settleUpUserId)?.userName || ""}
                    amount={debts.find(d => d.userId === settleUpUserId)?.amount || 0}
                    onSettle={async (amount) => {
                        await settleDebt(settleUpUserId, amount);
                    }}
                />
            )}
        </div>
    );
}
