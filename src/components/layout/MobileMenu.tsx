"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";

export function MobileMenu() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="lg:hidden">
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] border border-white/10 text-white/60 hover:text-white transition-colors"
                aria-label="Open Navigation"
            >
                <Menu className="h-5 w-5" />
            </button>

            {/* Overlay + Sidebar Drawer */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-50 w-64 animate-in slide-in-from-left duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:text-white transition-colors"
                            aria-label="Close Navigation"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <Sidebar className="flex w-full h-full" />
                    </div>
                </>
            )}
        </div>
    );
}
