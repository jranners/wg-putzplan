import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageTransition } from "@/components/layout/PageTransition";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-10 pb-32 md:pb-10">
                <div className="mx-auto max-w-[1600px]">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </div>
            </main>
            <MobileNav />
        </div>
    );
}
