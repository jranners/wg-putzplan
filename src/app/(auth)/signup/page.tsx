"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Loader2, ArrowRight, Check, Camera } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState, useRef } from "react";
import { registerUser, verifyInviteCode } from "@/app/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function SignupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Entry, 2: Account, 3: Profile
    const [mode, setMode] = useState<"join" | "found" | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [inviteCode, setInviteCode] = useState("");
    const [wgName, setWgName] = useState("");
    const [wgImageBase64, setWgImageBase64] = useState("");
    const [accountData, setAccountData] = useState({ name: "", email: "", password: "" });
    const [profileData, setProfileData] = useState({ paypalMeHandle: "", avatarBase64: "" });

    // Step 1: Verify Code or Found WG
    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await verifyInviteCode(inviteCode);
            if (res.success) {
                setWgName(res.data.wgName);
                setStep(2);
                toast.success(`Code akzeptiert für WG: ${res.data.wgName}`);
            } else {
                toast.error(res.error);
            }
        } catch (err) {
            toast.error("Code konnte nicht überprüft werden.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFoundWG = (e: React.FormEvent) => {
        e.preventDefault();
        if (!wgName) {
            toast.error("Bitte einen WG-Namen eingeben.");
            return;
        }
        setStep(2);
    };

    // Step 2: Account Info -> just validation then next step
    const handleAccountNext = (e: React.FormEvent) => {
        e.preventDefault();
        if (!accountData.name || !accountData.email || !accountData.password) {
            toast.error("Bitte alle Felder ausfüllen.");
            return;
        }
        if (accountData.password.length < 6) {
            toast.error("Passwort muss mindestens 6 Zeichen haben.");
            return;
        }
        setStep(3);
    };

    // Step 3: Optional Profile -> Submit Everything
    const handleFinalSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let res;
            if (mode === "join") {
                res = await registerUser(
                    accountData.name,
                    accountData.email,
                    accountData.password,
                    inviteCode,
                    profileData.paypalMeHandle,
                    profileData.avatarBase64
                );
            } else {
                const { registerUserAndWG } = await import("@/app/actions");
                res = await registerUserAndWG(
                    accountData.name,
                    accountData.email,
                    accountData.password,
                    wgName,
                    profileData.paypalMeHandle,
                    profileData.avatarBase64,
                    wgImageBase64
                );
            }

            if (!res.success) {
                toast.error(res.error);
                return;
            }

            toast.success(mode === "found" ? "WG gegründet und Account erstellt!" : "Willkommen bei TidyUp!");

            // Auto Login
            const loginRes = await signIn("credentials", {
                email: accountData.email,
                password: accountData.password,
                redirect: false,
            });

            if (loginRes?.error) {
                router.push("/login");
            } else {
                router.push("/");
            }
        } catch (error) {
            toast.error("Fehler bei der Registrierung.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isWgImage = false) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error("Bild ist zu groß (Max 10MB)");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const { compressImage } = await import("@/lib/utils/image");
                    const compressed = await compressImage(reader.result as string);
                    if (isWgImage) {
                        setWgImageBase64(compressed);
                    } else {
                        setProfileData({ ...profileData, avatarBase64: compressed });
                    }
                    toast.success("Bild optimiert");
                } catch (err) {
                    toast.error("Bildverarbeitung fehlgeschlagen");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 lg:p-10 relative overflow-hidden bg-black text-white selection:bg-[#13b6ec]/30">
            {/* Visual Polish */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] lg:opacity-[0.05] hidden lg:block" style={{ backgroundImage: 'radial-gradient(circle, #13b6ec 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-[#13b6ec]/5 blur-[100px] pointer-events-none lg:hidden"></div>

            <div className="w-full max-w-[440px] z-10 flex flex-col">

                {/* Logo */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="bg-[#13b6ec] w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-black shadow-lg shadow-[#13b6ec]/20">
                        <Layers className="h-6 w-6" />
                    </div>
                    <h1 className="text-2xl font-bold uppercase italic tracking-tighter">
                        Tidy<span className="text-[#13b6ec]">Up</span>
                    </h1>
                    <div className="flex gap-2 mt-4">
                        <StepIndicator step={1} current={step} />
                        <StepIndicator step={2} current={step} />
                        <StepIndicator step={3} current={step} />
                    </div>
                </div>

                {/* Wizard Card */}
                <div className="bg-card border border-border p-8 rounded-2xl shadow-2xl w-full text-center">

                    <AnimatePresence mode="wait">
                        {step === 1 && !mode && (
                            <motion.div
                                key="step1-entry"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold italic uppercase tracking-tight">Willkommen</h2>
                                    <p className="text-white/40 text-sm italic">Möchtest du einer WG beitreten oder eine neue gründen?</p>
                                </div>
                                <div className="grid gap-3">
                                    <Button
                                        onClick={() => setMode("join")}
                                        className="h-14 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#13b6ec]/50 text-white font-medium justify-between group transition-all"
                                    >
                                        WG beitreten
                                        <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-[#13b6ec] translate-x-0 group-hover:translate-x-1 transition-all" />
                                    </Button>
                                    <Button
                                        onClick={() => setMode("found")}
                                        className="h-14 bg-[#13b6ec] hover:bg-[#13b6ec]/90 text-black font-bold justify-between group transition-all shadow-lg shadow-[#13b6ec]/10"
                                    >
                                        Neue WG gründen
                                        <Layers className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 1 && mode === "join" && (
                            <motion.form
                                key="step1-join"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleVerifyCode}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold uppercase tracking-tight italic">WG-Code eingeben</h2>
                                    <p className="text-white/40 text-sm">Du benötigst einen Einladungscode von deinem WG-Admin.</p>
                                </div>
                                <Input
                                    value={inviteCode}
                                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                    placeholder="XXXX-123456"
                                    className="text-center font-mono text-lg tracking-widest uppercase bg-black/50 border-white/10 h-14 text-white focus:ring-1 focus:ring-[#13b6ec]/50"
                                    autoFocus
                                />
                                <Button disabled={isLoading || !inviteCode} type="submit" className="w-full bg-[#13b6ec] text-black font-bold h-12 hover:bg-[#13b6ec]/90 transition-colors">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Code prüfen"}
                                </Button>
                            </motion.form>
                        )}

                        {step === 1 && mode === "found" && (
                            <motion.form
                                key="step1-found"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleFoundWG}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold uppercase tracking-tight italic">WG gründen</h2>
                                    <p className="text-white/40 text-sm">Wie soll dein neues Zuhause heißen?</p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-center -mb-2">
                                        <div className="relative group cursor-pointer w-20 h-20">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center transition-colors group-hover:border-primary/50">
                                                {wgImageBase64 ? (
                                                    <img src={wgImageBase64} alt="WG Image" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Camera className="text-white/40 h-6 w-6" />
                                                        <span className="text-[8px] font-bold text-white/20 uppercase">WG-Logo</span>
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={(e) => handleImageUpload(e, true)}
                                            />
                                        </div>
                                    </div>
                                    <Input
                                        value={wgName}
                                        onChange={(e) => setWgName(e.target.value)}
                                        placeholder="WG-Name (z.B. Schloss am See)"
                                        className="bg-black/50 border-white/10 h-14 text-white focus:ring-1 focus:ring-primary/50 text-center font-bold"
                                        autoFocus
                                        required
                                    />
                                </div>
                                <Button disabled={!wgName} type="submit" className="w-full bg-primary text-black font-bold h-12 hover:bg-primary/90 transition-colors">
                                    WG Erstellen
                                </Button>
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleAccountNext}
                                className="space-y-4 text-left"
                            >
                                <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold">Account erstellen</h2>
                                    <p className="text-[#13b6ec] text-sm font-medium">Beitritt zu: {wgName}</p>
                                </div>

                                <Input placeholder="Dein Name" value={accountData.name} onChange={e => setAccountData({ ...accountData, name: e.target.value })} className="bg-black/50 border-white/10 text-white" required />
                                <Input type="email" placeholder="Email" value={accountData.email} onChange={e => setAccountData({ ...accountData, email: e.target.value })} className="bg-black/50 border-white/10 text-white" required />
                                <Input type="password" placeholder="Passwort" value={accountData.password} onChange={e => setAccountData({ ...accountData, password: e.target.value })} className="bg-black/50 border-white/10 text-white" required minLength={6} />

                                <Button type="submit" className="w-full bg-white text-black font-bold h-12 mt-2 hover:bg-white/90 transition-colors">
                                    Weiter <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.form
                                key="step3"
                                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleFinalSubmit}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold">Dein Profil</h2>
                                    <p className="text-white/40 text-sm">Fast geschafft! Personalisiere deinen Account.</p>
                                </div>

                                {/* Avatar Upload */}
                                <div className="flex justify-center">
                                    <div className="relative group cursor-pointer w-24 h-24">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center transition-colors group-hover:border-white/40">
                                            {profileData.avatarBase64 ? (
                                                <img src={profileData.avatarBase64} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="text-white/40 h-8 w-8 transition-colors group-hover:text-white/60" />
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} />
                                    </div>
                                </div>

                                <div className="space-y-2 text-left">
                                    <label className="text-xs uppercase font-bold text-white/50 ml-1">PayPal.me (Optional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">paypal.me/</span>
                                        <Input
                                            placeholder="deinName"
                                            className="pl-24 bg-black/50 border-white/10 text-white"
                                            value={profileData.paypalMeHandle}
                                            onChange={e => setProfileData({ ...profileData, paypalMeHandle: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <Button disabled={isLoading} type="submit" className="w-full bg-[#13b6ec] text-black font-bold h-12 hover:bg-[#13b6ec]/90 transition-colors">
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Registrierung abschließen"}
                                </Button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    {/* Back / Login Link */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                        {step === 1 ? (
                            <Link href="/login" className="text-white/40 hover:text-white text-sm transition-colors">
                                Zurück zum Login
                            </Link>
                        ) : (
                            <button onClick={() => setStep(s => s - 1)} className="text-white/40 hover:text-white text-sm transition-colors">
                                Zurück
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </main>
    );
}

function StepIndicator({ step, current }: { step: number; current: number }) {
    return (
        <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step <= current ? "bg-[#13b6ec]" : "bg-white/10"}`} />
    );
}
