import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { User, Bell, Palette, Home, Shield } from "lucide-react";
import { getWGData, getUsers } from "@/app/actions";
import { WGMemberList } from "@/components/settings/WGMemberList";
import { PayPalSettings } from "@/components/settings/PayPalSettings";
import { getCurrentUser } from "@/lib/auth";
import { SettingsItem, LogoutItem } from "@/components/settings/SettingsItem";

export default async function SettingsPage() {
    const userSession = await getCurrentUser();
    const currentUserId = userSession?.id || "1";

    const wgResult = await getWGData();
    const wgData = wgResult.success ? wgResult.data : null;
    const isAdmin = wgData?.wg?.adminId === currentUserId;

    // Fetch full user data to get paypal handle
    const users = await getUsers();
    const currentUserData = users.find(u => u.id === currentUserId);

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
                            <SettingsItem label="Profil bearbeiten" value={currentUserData?.name || "Benutzer"} />
                            <SettingsItem label="Passwort ändern" value="Google Auth" />
                            <LogoutItem />
                        </SettingsSection>

                        <SettingsSection title="Verknüpfungen" icon={User}>
                            <div className="p-4">
                                <PayPalSettings currentHandle={currentUserData?.paypalMeHandle} />
                            </div>
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

                        <SettingsSection title="System" icon={Shield}>
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

