"use client";

import { useState, useTransition } from "react";
import { updatePayPalHandle } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PayPalSettings({ currentHandle }: { currentHandle?: string | null }) {
    const [handle, setHandle] = useState(currentHandle || "");
    const [isPending, startTransition] = useTransition();

    const handleSave = () => {
        startTransition(async () => {
            const result = await updatePayPalHandle(handle);
            if (result.success) {
                // Simple alert for now as we removed sonner to avoid dependency issues
                alert("PayPal Handle gespeichert");
            } else {
                alert("Fehler beim Speichern");
            }
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase text-white/40">PayPal.Me Nutzername</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">paypal.me/</span>
                        <Input
                            value={handle}
                            onChange={(e) => setHandle(e.target.value)}
                            className="bg-black/20 border-white/10 pl-24 text-white"
                            placeholder="deinusername"
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isPending || handle === currentHandle}
                        className="bg-[#003087] hover:bg-[#003087]/80 text-white"
                    >
                        {isPending ? "..." : "Speichern"}
                    </Button>
                </div>
                <p className="text-[10px] text-white/30">
                    Wird verwendet, um Zahlungslinks für deine Mitbewohner zu generieren.
                </p>
            </div>
        </div>
    );
}
