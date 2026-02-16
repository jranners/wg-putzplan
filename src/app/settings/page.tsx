import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { User, Bell, Palette, ChevronRight, Home } from "lucide-react";
import { getWGData } from "@/app/actions";
import { WGMemberList } from "@/components/settings/WGMemberList";

export default async function SettingsPage() {
    const currentUserId = "1"; // TODO: get from session
    const wgResult = await getWGData();
    const wgData = wgResult.success ? wgResult.data : null;
    const isAdmin = wgData?.wg?.adminId === currentUserId;

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-[#000000] p-4 lg:p-10 pb-32 lg:pb-10">
                <div className="mx-auto max-w-2xl space-y-8">
                    <header>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Einstellungen</h1>
                        <p className="text-white/40">Verwalte deine App-Präferenzen und Profil</p>
                    </header>

                    <div className="space-y-4">
                        <SettingsSection title="Account" icon={User}>
                            <SettingsItem label="Profil bearbeiten" value="M. Schmidt" />
                            <SettingsItem label="Passwort ändern" />
                            <SettingsItem label="Benachrichtigungen" value="An" />
                        </SettingsSection>

                        {/* Meine WG Section */}
                        <section className="rounded-xl border border-white/5 bg-[#1A1A1A] overflow-hidden">
                            <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
                                <Home className="h-4 w-4 text-[#13b6ec]" />
                                <span className="text-xs font-bold uppercase tracking-wider text-white/60">Meine WG</span>
                            </div>
                            <div className="p-4">
                                {wgData ? (
                                    <WGMemberList
                                        members={wgData.members}
                                        inviteCodes={wgData.inviteCodes}
                                        wgName={wgData.wg?.name || "Meine WG"}
                                        currentUserId={currentUserId}
                                        isAdmin={isAdmin}
                                    />
                                ) : (
                                    <p className="text-sm text-white/40 text-center py-4">
                                        WG-Daten konnten nicht geladen werden.
                                    </p>
                                )}
                            </div>
                        </section>

                        <SettingsSection title="Darstellung" icon={Palette}>
                            <SettingsItem label="Theme" value="Pure Black" />
                            <SettingsItem label="Animationen" value="Reduziert" />
                        </SettingsSection>

                        <SettingsSection title="System" icon={Bell}>
                            <SettingsItem label="Version" value="1.0.0" />
                            <SettingsItem label="Datenschutz" />
                            <SettingsItem label="Impressum" />
                        </SettingsSection>
                    </div>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}

function SettingsSection({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-white/5 bg-[#1A1A1A] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/5 px-4 py-3">
                <Icon className="h-4 w-4 text-[#13b6ec]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white/60">{title}</span>
            </div>
            <div className="divide-y divide-white/5">
                {children}
            </div>
        </section>
    );
}

function SettingsItem({ label, value }: { label: string, value?: string }) {
    return (
        <button className="flex w-full items-center justify-between px-4 py-4 transition-colors hover:bg-white/5 text-left">
            <span className="text-sm font-medium text-white">{label}</span>
            <div className="flex items-center gap-2">
                {value && <span className="text-xs text-white/40">{value}</span>}
                <ChevronRight className="h-4 w-4 text-white/20" />
            </div>
        </button>
    );
}
