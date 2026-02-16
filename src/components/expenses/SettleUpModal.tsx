"use client";

import * as React from "react";
import { X, Send, CreditCard, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SettleUpModalProps {
    isOpen?: boolean;
    open?: boolean;
    onClose?: () => void;
    onOpenChange?: (open: boolean) => void;
    debtorName: string;
    amount: number;
    onSettle: (amount: number) => Promise<void>;
}

export function SettleUpModal({
    isOpen,
    open,
    onClose,
    onOpenChange,
    debtorName = "",
    amount = 0,
    onSettle
}: SettleUpModalProps) {
    const isModalOpen = open ?? isOpen ?? false;
    const handleClose = () => {
        onClose?.();
        onOpenChange?.(false);
    };

    const [inputValue, setInputValue] = React.useState(Math.abs(amount).toString());

    // Update input value when amount changes
    React.useEffect(() => {
        setInputValue(Math.abs(amount).toString());
    }, [amount]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState<"paypal" | "transfer" | "cash">("paypal");

    const handleSettle = async () => {
        setIsSubmitting(true);
        try {
            await onSettle(parseFloat(inputValue));
            onClose?.();
        } catch (error) {
            console.error("Settle up failed:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isModalOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md border-white/10 bg-[#000000] p-0 text-white shadow-2xl overflow-hidden">
                <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-[#13b6ec]/10 blur-3xl"></div>

                <DialogHeader className="p-6 relative z-10">
                    <DialogTitle className="text-xl font-bold tracking-tight">Settle Up</DialogTitle>
                </DialogHeader>

                <div className="p-6 space-y-8 relative z-10">
                    {/* Recipient Info */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-bold border-2 border-[#13b6ec]/20">
                            {debtorName ? debtorName.split(' ').map(n => n[0]).join('') : "?"}
                        </div>
                        <div>
                            <p className="text-sm text-white/40 font-bold uppercase tracking-widest">Zahlung an</p>
                            <h3 className="text-xl font-bold">{debtorName}</h3>
                        </div>
                    </div>

                    {/* Amount Input */}
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/20 text-2xl font-bold">€</div>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-6 pl-12 pr-4 text-4xl font-bold text-center focus:outline-none focus:border-[#13b6ec]/50 transition-colors"
                            placeholder="0.00"
                        />
                    </div>

                    {/* Payment Methods */}
                    <div className="grid grid-cols-3 gap-3">
                        <PaymentMethodButton
                            isActive={paymentMethod === "paypal"}
                            onClick={() => setPaymentMethod("paypal")}
                            icon={Wallet}
                            label="PayPal"
                        />
                        <PaymentMethodButton
                            isActive={paymentMethod === "transfer"}
                            onClick={() => setPaymentMethod("transfer")}
                            icon={Building2}
                            label="Überweisung"
                        />
                        <PaymentMethodButton
                            isActive={paymentMethod === "cash"}
                            onClick={() => setPaymentMethod("cash")}
                            icon={CreditCard}
                            label="Bar"
                        />
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleSettle}
                        disabled={isSubmitting || !inputValue}
                        className="w-full py-8 text-lg font-extrabold uppercase tracking-widest bg-[#13b6ec] hover:bg-[#13b6ec]/90 rounded-xl group relative overflow-hidden"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            {isSubmitting ? "Wird gesendet..." : "Jetzt Ausgleichen"}
                            {!isSubmitting && <Send className="h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function PaymentMethodButton({ isActive, onClick, icon: Icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border border-white/5 transition-all text-[10px] font-bold uppercase tracking-wider",
                isActive ? "bg-[#13b6ec]/20 border-[#13b6ec] text-[#13b6ec]" : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
            )}
        >
            <Icon className="h-5 w-5" />
            {label}
        </button>
    );
}
