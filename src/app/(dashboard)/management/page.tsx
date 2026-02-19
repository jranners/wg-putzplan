"use client";

import { useEffect, useState } from "react";
import { getWGData, resetWGData, ActionResponse, WGData } from "@/app/actions";
import {
    Users,
    Link as LinkIcon,
    Settings as SettingsIcon,
    ShieldAlert,
    Trash2,
    Plus,
    Copy,
    Check,
    AlertTriangle,
    Loader2,
    Camera
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ManagementPage() {
    const router = useRouter();
    const [data, setData] = useState<WGData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isResetting, setIsResetting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetStep, setResetStep] = useState(1);
    const [confirmName, setConfirmName] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const res = await getWGData();
            if (res.success) {
                setData(res.data);
            } else {
                toast.error(res.error);
            }
        } catch (error) {
            toast.error("Management-Daten konnten nicht geladen werden.");
        } finally {
            setIsLoading(false);
        }
    }

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedId(code);
        toast.success("Code kopiert!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleFullReset = async () => {
        if (confirmName !== data?.wg?.name) {
            toast.error("WG-Name stimmt nicht überein.");
            return;
        }

        setIsResetting(true);
        try {
            const res = await resetWGData();
            if (res.success) {
                toast.success("System wurde vollständig zurückgesetzt.");
                await signOut({ callbackUrl: "/signup" });
            } else {
                toast.error(res.error);
                setIsResetting(false);
            }
        } catch (error) {
            toast.error("Fehler beim Zurücksetzen.");
            setIsResetting(false);
        }
    };

    const handleWGImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                try {
                    const { compressImage } = await import("@/lib/utils/image");
                    const compressed = await compressImage(reader.result as string);
                    const { updateWGImage } = await import("@/app/actions");
                    const res = await updateWGImage(compressed);
                    if (res.success) {
                        toast.success("WG-Bild aktualisiert!");
                        loadData();
                    } else {
                        toast.error(res.error);
                    }
                } catch (err) {
                    toast.error("Bildverarbeitung fehlgeschlagen");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    if (isLoading) return <div className="p-8 text-white/40 italic">Lade Management-Zentrale...</div>;
    if (!data?.wg) return <div className="p-8 text-white/40 italic">Keine WG-Zugehörigkeit gefunden.</div>;

    const isAdmin = data.wg.adminId === data.currentUserId;

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold uppercase italic tracking-tighter text-foreground">
                        WG<span className="text-primary">Management</span>
                    </h1>
                    <p className="text-muted-foreground text-sm italic">Verwalte deine WG, Mitglieder und Einladungen.</p>
                </div>
                <Button
                    variant="ghost"
                    onClick={() => router.push('/')}
                    className="md:hidden text-muted-foreground hover:text-primary transition-colors"
                >
                    Dashboard
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* WG Info & Settings */}
                <section className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <SettingsIcon size={80} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3 text-primary z-10">
                        <SettingsIcon className="h-5 w-5" />
                        <h2 className="font-bold uppercase text-xs tracking-[0.2em]">WG-Einstellungen</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-start z-10">
                        <div className="relative group/avatar cursor-pointer w-24 h-24 shrink-0">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-background/40 border border-border flex items-center justify-center transition-all group-hover/avatar:border-primary/50 shadow-lg relative">
                                {data.wg.image ? (
                                    <img src={data.wg.image} alt="WG Image" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera className="text-muted-foreground h-8 w-8" />
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                    <Plus className="text-white h-6 w-6" />
                                </div>
                            </div>
                            {isAdmin && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleWGImageUpload}
                                />
                            )}
                        </div>

                        <div className="flex-1 space-y-4 w-full">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Name der WG</label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        defaultValue={data.wg.name}
                                        disabled={!isAdmin}
                                        className="bg-background/40 border-border text-foreground h-12 focus:ring-primary/50"
                                    />
                                    {isAdmin && (
                                        <Button className="bg-primary text-primary-foreground font-bold px-6 h-12 hover:bg-primary/90 transition-all active:scale-95">Speichern</Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Invite Codes */}
                <section className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <LinkIcon size={80} className="text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between z-10">
                        <div className="flex items-center gap-3 text-primary">
                            <LinkIcon className="h-5 w-5" />
                            <h2 className="font-bold uppercase text-xs tracking-[0.2em]">Einladungscodes</h2>
                        </div>
                        {isAdmin && (
                            <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/5 text-primary transition-all hover:rotate-90">
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3 z-10">
                        {data.inviteCodes.length > 0 ? (
                            data.inviteCodes.map(code => (
                                <div key={code.id} className="flex items-center justify-between bg-background/40 border border-border p-4 rounded-xl group transition-all hover:border-primary/20 hover:bg-background/60">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-foreground text-base tracking-[0.2em] font-bold">{code.code}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">LÄUFT AB: {new Date(code.expiresAt).toLocaleDateString('de-DE')}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(code.code)}
                                        className="hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all active:scale-90"
                                    >
                                        {copiedId === code.code ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 border border-dashed border-border rounded-xl text-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Keine aktiven Codes</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Member List */}
                <section className="bg-card border border-border p-6 rounded-2xl flex flex-col gap-6 lg:col-span-2 shadow-xl">
                    <div className="flex items-center gap-3 text-primary">
                        <Users className="h-5 w-5" />
                        <h2 className="font-bold uppercase text-xs tracking-[0.2em]">Mitglieder ({data.members.length})</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.members.map(member => (
                            <div key={member.id} className="flex items-center gap-4 bg-background/40 border border-border p-4 rounded-xl group hover:border-primary/30 transition-all hover:bg-background/60 relative overflow-hidden">
                                {member.id === data.wg?.adminId && (
                                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[8px] font-black px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">Owner</div>
                                )}
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-800 border-2 border-border shrink-0 group-hover:border-primary/20 transition-all shadow-lg">
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground font-black tracking-tighter">USER</div>
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">{member.name}</p>
                                    <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">{member.id === data.currentUserId ? 'DU' : (member.role === 'admin' ? 'Admin' : 'Mitglied')}</p>
                                </div>
                                {isAdmin && member.id !== data.wg?.adminId && (
                                    <Button variant="ghost" className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Danger Zone */}
                {isAdmin && (
                    <section className="bg-destructive/[0.03] border border-destructive/10 p-8 rounded-2xl flex flex-col gap-6 lg:col-span-2 mt-4 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 text-destructive/5 rotate-12">
                            <ShieldAlert size={160} />
                        </div>
                        <div className="flex items-center gap-3 text-destructive shrink-0">
                            <ShieldAlert className="h-5 w-5" />
                            <h2 className="font-bold uppercase text-xs tracking-[0.2em]">Danger Zone</h2>
                        </div>

                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                            <div className="max-w-xl">
                                <h3 className="font-bold text-foreground text-lg italic tracking-tight uppercase">System vollständig zurücksetzen</h3>
                                <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                                    Dies wird die gesamte WG, alle Aufgaben, Transaktionen und alle Mitglieder (einschließlich deines Accounts) unwiderruflich löschen. Das Tool wird auf Werkseinstellungen zurückgesetzt.
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowResetModal(true)}
                                variant="ghost"
                                className="bg-destructive/10 hover:bg-destructive text-foreground hover:text-destructive-foreground font-black border border-destructive/20 px-8 h-12 transition-all shrink-0 active:scale-95 uppercase italic text-xs tracking-widest shadow-lg shadow-destructive/5"
                            >
                                WG Reset
                            </Button>
                        </div>
                    </section>
                )}

            </div>

            {/* Reset Modal Overlay */}
            <AnimatePresence>
                {showResetModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-md bg-black/80">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-card border border-destructive/30 p-8 rounded-3xl max-w-md w-full shadow-2xl shadow-destructive/10 flex flex-col gap-6"
                        >
                            {resetStep === 1 ? (
                                <>
                                    <div className="flex flex-col items-center text-center gap-4">
                                        <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                                            <AlertTriangle size={32} />
                                        </div>
                                        <h2 className="text-2xl font-black uppercase italic italic tracking-tighter">Bist du sicher?</h2>
                                        <p className="text-muted-foreground text-sm leading-relaxed">
                                            Diese Aktion kann nicht rückgängig gemacht werden. Alle Daten deiner WG werden sofort und dauerhaft vom Server gelöscht.
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-3 mt-2">
                                        <Button
                                            onClick={() => setResetStep(2)}
                                            className="h-14 bg-destructive text-destructive-foreground font-black uppercase italic tracking-widest hover:bg-destructive/90 transition-all active:scale-95 shadow-lg shadow-destructive/20"
                                        >
                                            Ich verstehe, weiter
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowResetModal(false)}
                                            className="h-12 text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        >
                                            Abbrechen
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-destructive">Bestätige WG-Namen</h2>
                                        <p className="text-muted-foreground text-sm">
                                            Um fortzufahren, gib bitte den Namen deiner WG ein: <span className="text-foreground font-bold italic">"{data.wg.name}"</span>
                                        </p>
                                        <Input
                                            value={confirmName}
                                            onChange={(e) => setConfirmName(e.target.value)}
                                            placeholder="WG-Name hier eingeben"
                                            className="h-14 bg-background border-destructive/20 text-foreground font-bold focus:ring-destructive/50"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <Button
                                            disabled={confirmName !== data.wg.name || isResetting}
                                            onClick={handleFullReset}
                                            className="h-14 bg-destructive text-destructive-foreground font-black uppercase italic tracking-widest hover:bg-destructive/90 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 shadow-xl shadow-destructive/30"
                                        >
                                            {isResetting ? <Loader2 className="animate-spin" /> : "WG ENDGÜLTIG LÖSCHEN"}
                                        </Button>
                                        <Button
                                            disabled={isResetting}
                                            variant="ghost"
                                            onClick={() => {
                                                setShowResetModal(false);
                                                setResetStep(1);
                                                setConfirmName("");
                                            }}
                                            className="h-12 text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        >
                                            Zurück
                                        </Button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
