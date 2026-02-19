import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DashboardHeader } from "@/components/dashboard/Header";
import { ScheduleView } from "@/components/dashboard/ScheduleView";
import { getTasks, getUsers } from "@/app/actions";

export default async function ZeitplanPage() {
    const [tasks, users] = await Promise.all([
        getTasks(),
        getUsers()
    ]);

    return (
        <div className="space-y-10">
            <DashboardHeader title="Zeitplan" />

            <div className="max-w-3xl">
                <ScheduleView tasks={tasks} users={users} />
            </div>
        </div>
    );
}
