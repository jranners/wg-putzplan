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
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-lg font-bold text-red-400 whitespace-nowrap">
                                        -{formatCurrency(debt.amount)}
                                    </span>
                                    {debt.paypalMeHandle && (
                                        <a
                                            href={`https://paypal.me/${debt.paypalMeHandle}/${Math.abs(debt.amount)}eur`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[10px] bg-[#003087] text-white px-2 py-1 rounded hover:bg-[#003087]/80 transition-colors flex items-center gap-1"
                                        >
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M7.076 21.337H4.75a.5.5 0 0 1-.496-.568l1.62-10.435a.5.5 0 0 1 .496-.434h2.908a5.558 5.558 0 0 1 2.37.525c.67.33 1.205.82 1.572 1.45.69 1.185.748 2.652.164 4.125-.38 1.05-.98 1.95-1.745 2.62a5.4 5.4 0 0 1-2.906 1.047l-.28.016c-.33 0-.616.24-.666.566l-.71 4.54a.502.502 0 0 1-.497.434h-.5zM8.33 12.01l-1.127 7.222h1.49l.65-4.148c.07-.46.467-.798.932-.798.24 0 .47.018.694.02 1.103-.09 2.05-.63 2.585-1.55.51-1.02.507-2.18.15-3.08-.28-.59-.7-1.05-1.22-1.34a4.05 4.05 0 0 0-1.77-.38H8.86a.5.5 0 0 0-.496.434l-.034.22z" />
                                                <path d="M19.344 6.134c-1.17-1.99-3.235-3.05-6.242-2.956-2.583.08-4.99 1.258-5.23 4.167l-.274 1.76h-2.1l2.427-15.53C8.017.65 8.8.006 9.722.006h4.636c3.483 0 6.062 1.26 6.84 4.295.05.203.09.41.116.62.083 1.14-.144 2.146-.665 2.986l-.42.72c-.22.378-.466.726-.732 1.043l.426-2.73 1.42-.806z" />
                                            </svg>
                                            PayPal
                                        </a>
                                    )}
                                </div>
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
