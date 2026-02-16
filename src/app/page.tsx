import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardHeader } from "@/components/dashboard/Header";
import { FinanceWidget } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { TaskList } from "@/components/dashboard/TaskCard";
import { Timeline } from "@/components/dashboard/Timeline";
import { getDashboardData } from "@/app/actions";

export default async function Home() {
    const result = await getDashboardData();
    if (!result.success) throw new Error(result.error);
    const data = result.data;

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            {/* Sidebar (Desktop) */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-[#000000] p-4 md:p-10 pb-32 md:pb-10"> {/* Adjusted padding for mobile */}
                <div className="mx-auto max-w-[1600px] space-y-10">
                    <DashboardHeader />

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-12">

                        {/* High Priority: Tasks (8 cols) */}
                        <div className="md:col-span-8">
                            <TaskList tasks={data.tasks} users={data.users} />
                        </div>

                        {/* Secondary: Finance (4 cols) */}
                        <div className="md:col-span-4 flex flex-col h-full">
                            <FinanceWidget finances={data.finances} debts={data.debts} />
                        </div>

                        {/* Timeline Section (12 cols) */}
                        <Timeline />

                        {/* Activity Feed (12 cols) */}
                        <div className="md:col-span-12">
                            <ActivityFeed activities={data.activities} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
