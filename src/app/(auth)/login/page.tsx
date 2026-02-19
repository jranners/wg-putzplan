"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LayoutList } from "lucide-react";
import { signIn } from "next-auth/react";

import { useSearchParams } from "next/navigation";

export default function LoginPage() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");

    const handleGoogleLogin = () => {
        signIn("google", { callbackUrl: "/" });
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-10 relative overflow-hidden bg-black text-white selection:bg-[#13b6ec]/30">
            {/* Visual Polish: Subtle top glow (Mobile) */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-[#13b6ec]/5 blur-[100px] pointer-events-none lg:hidden"></div>

            {/* Decorative Elements (Desktop) */}
            <div className="fixed bottom-0 left-0 p-8 opacity-10 hidden lg:block pointer-events-none">
                <div className="text-[10px] font-mono uppercase tracking-[0.4em] rotate-90 origin-left text-white">
                    Precision System v1.02 // Auth.Module
                </div>
            </div>
            <div className="fixed top-0 right-0 p-8 opacity-10 hidden lg:block pointer-events-none">
                <div className="grid grid-cols-4 gap-2">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="w-1 h-1 bg-[#13b6ec] rounded-full"></div>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-md z-10 flex flex-col items-center">
                {/* Logo / Brand Header */}
                <div className="mb-10 flex flex-col items-center">
                    <div className="w-12 h-12 bg-[#13b6ec] rounded flex items-center justify-center mb-4 text-black shadow-[0_0_20px_rgba(19,182,236,0.3)]">
                        <LayoutList className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white lg:hidden uppercase text-[#13b6ec]">TidyUp</h1>
                    <h1 className="text-2xl font-bold tracking-tight text-white hidden lg:block">TidyUp</h1>
                </div>

                {/* Authentication Card */}
                <div className="bg-[#1A1A1A] border border-[#333333] p-10 rounded-lg shadow-2xl w-full">
                    <header className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-2 text-white">Willkommen zurück</h2>
                        <p className="text-[#13b6ec]/60 text-sm font-medium">Melde dich mit deinem Google Konto an.</p>
                    </header>

                    {error === "CredentialsSignin" && (
                        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                            <p className="font-bold">Anmeldung fehlgeschlagen</p>
                            <p className="text-xs opacity-80 mt-1">Email oder Passwort ist falsch.</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                                const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
                                signIn("credentials", { email, password, callbackUrl: "/" });
                            }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email Adresse</label>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="name@beispiel.de"
                                    className="w-full bg-[#111] border border-[#333] text-white p-3 rounded-lg focus:border-[#13b6ec] focus:ring-1 focus:ring-[#13b6ec] outline-none transition-all placeholder:text-white/20"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Passwort</label>
                                <input
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-[#111] border border-[#333] text-white p-3 rounded-lg focus:border-[#13b6ec] focus:ring-1 focus:ring-[#13b6ec] outline-none transition-all placeholder:text-white/20"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-black font-bold h-12 rounded-lg">
                                Anmelden
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-[#333]"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-[#1A1A1A] px-2 text-white/40">Oder mit Google</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleGoogleLogin}
                            variant="outline"
                            className="w-full border-[#333333] bg-transparent hover:bg-white/5 text-white font-medium h-14 py-3 rounded-lg flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="currentColor"></path>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="currentColor"></path>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="currentColor"></path>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="currentColor"></path>
                            </svg>
                            <span>Mit Google anmelden</span>
                        </Button>
                    </div>
                </div>

                <footer className="mt-8 text-center">
                    <p className="text-white/40 text-sm">
                        Neu hier?
                        <Link href="/signup" className="text-[#13b6ec] hover:text-[#13b6ec]/80 hover:underline font-semibold ml-1">
                            Konto erstellen
                        </Link>
                    </p>
                </footer>
            </div>
        </main>
    );
}

