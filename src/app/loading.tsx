"use client";

import React from "react";

export default function Loading() {
    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black overflow-hidden relative">
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,182,236,0.05)_0%,transparent_70%)]" />

            {/* Loading Container */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Advanced Scanner Animation */}
                <div className="relative w-24 h-24 mb-8">
                    {/* Ring 1 - Outer Pulsating */}
                    <div className="absolute inset-0 rounded-full border border-[#13b6ec]/20 animate-ping" />

                    {/* Ring 2 - Rotating Segment */}
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#13b6ec] animate-spin" style={{ animationDuration: '0.8s' }} />

                    {/* Ring 3 - Counter Rotating Segment */}
                    <div className="absolute inset-2 rounded-full border border-transparent border-b-[#13b6ec]/60 animate-spin" style={{ animationDuration: '1.2s', animationDirection: 'reverse' }} />

                    {/* Core */}
                    <div className="absolute inset-[35%] bg-[#13b6ec] rounded-sm transform rotate-45 animate-pulse shadow-[0_0_15px_rgba(19,182,236,0.8)]" />
                </div>

                {/* Status Text with "Typing" feel */}
                <div className="flex flex-col items-center space-y-2">
                    <h2 className="text-[#13b6ec] font-mono text-sm tracking-[0.3em] uppercase">
                        System Initialization
                    </h2>
                    <div className="flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 bg-[#13b6ec] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 bg-[#13b6ec] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 bg-[#13b6ec] rounded-full animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Corner Decorative Elements */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t border-l border-[#13b6ec]/20" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t border-r border-[#13b6ec]/20" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b border-l border-[#13b6ec]/20" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b border-r border-[#13b6ec]/20" />

            {/* Hex Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/hexellence.png')]" />
        </div>
    );
}
