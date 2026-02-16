"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Check initial state
        setIsOffline(!navigator.onLine);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="flex items-center gap-3 bg-red-500 text-white px-4 py-3 rounded-full shadow-lg border border-red-400/20 backdrop-blur-md">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm font-bold">Du bist offline. Änderungen werden lokal gespeichert.</span>
            </div>
        </div>
    );
}
