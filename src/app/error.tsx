"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Critical Runtime Error:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-6 text-center overflow-hidden relative">
            {/* Glitch Background Effect */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,0,0,0.2)_0%,transparent_70%)]" />

            {/* Error Container */}
            <div className="relative z-10 max-w-lg w-full">
                {/* Warning Icon with Glow */}
                <div className="flex h-20 w-20 items-center justify-center rounded-sm bg-red-950/20 border border-red-500/30 mx-auto mb-8 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>

                {/* Error Header */}
                <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">
                    System-Kritischer Fehler
                </h1>
                <p className="text-[#13b6ec] font-mono text-xs mb-8 tracking-widest uppercase">
                    Error Code: {error.digest || "UNIDENTIFIED_CRASH"}
                </p>

                {/* Error Box */}
                <div className="bg-[#1A1A1A] border border-white/5 p-6 mb-10 text-left rounded-sm">
                    <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-white/60 text-xs font-mono uppercase">Datenbank / Kernel Failure</span>
                    </div>
                    <p className="text-white/40 text-sm font-mono leading-relaxed">
                        Ein unerwarteter Fehler ist im Systemkern aufgetreten. Der Zugriff auf angeforderte Ressourcen wurde unterbrochen, um die Datenintegrität zu schützen.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => reset()}
                        variant="default"
                        className="w-full sm:w-auto bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-black px-8 py-6 rounded-none font-bold uppercase tracking-wider h-auto"
                    >
                        <RefreshCcw className="mr-2 h-5 w-5" />
                        System Recovery
                    </Button>
                    <Link href="/" className="w-full sm:w-auto">
                        <Button
                            variant="outline"
                            className="w-full sm:w-auto border-white/10 hover:bg-white/5 text-white/60 px-8 py-6 rounded-none font-bold uppercase tracking-wider h-auto"
                        >
                            <Home className="mr-2 h-5 w-5" />
                            Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Industrial Decors */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
        </div>
    );
}
