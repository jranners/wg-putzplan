"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-4 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Ups, etwas ist schiefgelaufen.</h2>
                    <p className="text-white/40 max-w-md mb-8">
                        Ein unerwarteter Fehler ist aufgetreten. Wir wurden benachrichtigt und kümmern uns darum.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black hover:bg-white/90 font-bold"
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Seite neu laden
                    </Button>
                </div>
            );
        }

        return this.props.children;
    }
}
