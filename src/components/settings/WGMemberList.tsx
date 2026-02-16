"use client";

import { useState } from "react";
import { User } from "@/types";
import { InviteCode } from "@/types";
import { kickMember, generateInviteCode } from "@/app/actions";
import {
    User as UserIcon,
    Crown,
    UserMinus,
    Copy,
    Check,
    Plus,
    Ticket,
    Loader2,
} from "lucide-react";

interface WGMemberListProps {
    members: User[];
    inviteCodes: InviteCode[];
    wgName: string;
    currentUserId: string;
    isAdmin: boolean;
}

export function WGMemberList({ members, inviteCodes, wgName, currentUserId, isAdmin }: WGMemberListProps) {
    const [kickingId, setKickingId] = useState<string | null>(null);
    const [confirmKickId, setConfirmKickId] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleKick = async (userId: string) => {
        if (confirmKickId !== userId) {
            setConfirmKickId(userId);
            return;
        }
        setKickingId(userId);
        setError(null);
        try {
            const result = await kickMember(userId);
            if (!result.success) {
                setError(result.error || "Fehler beim Entfernen");
            }
        } catch {
            setError("Verbindungsfehler");
        } finally {
            setKickingId(null);
            setConfirmKickId(null);
        }
    };

    const handleGenerateCode = async () => {
        setGenerating(true);
        setError(null);
        try {
            const result = await generateInviteCode();
            if (result.success) {
                setGeneratedCode(result.data.code);
            } else {
                setError(result.error || "Fehler beim Erstellen");
            }
        } catch {
            setError("Verbindungsfehler");
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async (code: string) => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-4">
            {/* WG Name */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white">{wgName}</h3>
                    <p className="text-xs text-white/40">{members.length} Mitglieder</p>
                </div>
            </div>

            {/* Member List */}
            <div className="space-y-1">
                {members.map((member) => {
                    const isCurrentUser = member.id === currentUserId;
                    const isMemberAdmin = member.role === "admin";

                    return (
                        <div
                            key={member.id}
                            className="flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-white/5"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold ${isMemberAdmin
                                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                                    : "bg-[#13B6EC]/10 border border-[#13B6EC]/20 text-[#13B6EC]"
                                    }`}>
                                    {member.name.split(" ").map(n => n[0]).join("")}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-white">
                                            {member.name}
                                            {isCurrentUser && <span className="text-white/30 ml-1">(Du)</span>}
                                        </span>
                                        {isMemberAdmin && (
                                            <Crown className="h-3 w-3 text-amber-400" />
                                        )}
                                    </div>
                                    <span className="text-[10px] uppercase tracking-wider text-white/30">
                                        {isMemberAdmin ? "Admin" : "Mitglied"}
                                    </span>
                                </div>
                            </div>

                            {/* Kick button — only for admin, not for self */}
                            {isAdmin && !isCurrentUser && (
                                <button
                                    onClick={() => handleKick(member.id)}
                                    disabled={kickingId === member.id}
                                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${confirmKickId === member.id
                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                        : "text-white/30 hover:text-red-400 hover:bg-red-500/10"
                                        }`}
                                >
                                    {kickingId === member.id ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <UserMinus className="h-3 w-3" />
                                    )}
                                    {confirmKickId === member.id ? "Bestätigen?" : "Entfernen"}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Error banner */}
            {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs text-red-400">
                    {error}
                </div>
            )}

            {/* Invite Code Section — admin only */}
            {isAdmin && (
                <div className="mt-6 space-y-3 border-t border-white/5 pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-[#13B6EC]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-white/60">
                                Einladungscodes
                            </span>
                        </div>
                        <button
                            onClick={handleGenerateCode}
                            disabled={generating}
                            className="flex items-center gap-1.5 rounded-lg bg-[#13B6EC]/10 border border-[#13B6EC]/20 px-3 py-1.5 text-xs font-medium text-[#13B6EC] transition-all hover:bg-[#13B6EC]/20 disabled:opacity-50"
                        >
                            {generating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                                <Plus className="h-3 w-3" />
                            )}
                            Code generieren
                        </button>
                    </div>

                    {/* Freshly generated code highlight */}
                    {generatedCode && (
                        <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-emerald-400/60 mb-0.5">Neuer Code</p>
                                <p className="font-mono text-sm font-bold text-emerald-400">{generatedCode}</p>
                            </div>
                            <button
                                onClick={() => handleCopy(generatedCode)}
                                className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/30"
                            >
                                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                {copied ? "Kopiert!" : "Kopieren"}
                            </button>
                        </div>
                    )}

                    {/* Active codes */}
                    {inviteCodes.length > 0 && (
                        <div className="space-y-1">
                            {inviteCodes.map((ic) => (
                                <div
                                    key={ic.id}
                                    className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2"
                                >
                                    <span className="font-mono text-xs text-white/60">{ic.code}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-white/30">
                                            Gültig bis {new Date(ic.expiresAt).toLocaleDateString("de-DE")}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(ic.code)}
                                            className="text-white/20 hover:text-white/60 transition-colors"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {inviteCodes.length === 0 && !generatedCode && (
                        <p className="text-xs text-white/30 text-center py-2">
                            Noch keine aktiven Einladungscodes.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
