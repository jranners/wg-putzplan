import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { DetailedTaskList } from "@/components/tasks/DetailedTaskList";
import { TasksView } from "@/components/tasks/TasksView";
import { getTasks, getUsers } from "@/app/actions";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function TasksPage() {
    const tasks = await getTasks();
    const users = await getUsers();

    const openTasks = tasks.filter(t => !t.isDone);
    const completedTasks = tasks.filter(t => t.isDone);

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-[#000000] p-6 lg:p-10 pb-32 lg:pb-10">
                <div className="mx-auto max-w-4xl space-y-8">

                    {tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="relative mb-10 flex h-48 w-48 items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-[#13b6ec]/5 blur-3xl"></div>
                                <div className="relative">
                                    <div className="flex h-32 w-32 items-center justify-center">
                                        <svg className="h-24 w-24 stroke-[#13b6ec] stroke-[0.75] fill-none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                                            <path className="stroke-[#13b6ec]/40" d="M6 1L6 4M10 1L10 4M14 1L14 4"></path>
                                        </svg>
                                    </div>
                                    <div className="absolute -right-4 -top-4 h-8 w-8 rounded-tr-lg border-r-2 border-t-2 border-[#13b6ec]/30"></div>
                                    <div className="absolute -bottom-4 -left-4 h-8 w-8 rounded-bl-lg border-b-2 border-l-2 border-[#13b6ec]/30"></div>
                                </div>
                            </div>
                            <h1 className="mb-4 text-3xl font-bold tracking-tight text-white">
                                Alles erledigt!
                            </h1>
                            <p className="mb-10 max-w-[340px] text-base leading-relaxed text-slate-400">
                                Herausragende Arbeit. Deine WG glänzt und alle Aufgaben sind erledigt.
                            </p>
                            <Button className="group relative flex h-14 items-center gap-2 rounded-lg bg-[#13b6ec] px-8 font-bold text-black shadow-lg shadow-[#13b6ec]/20 transition-all hover:bg-[#13b6ec]/90 hover:shadow-[0_0_20px_rgba(19,182,236,0.4)] active:scale-95">
                                <PlusCircle className="mr-1 h-5 w-5" />
                                Aufgabe erstellen
                            </Button>
                        </div>
                    ) : (
                        <TasksView openTasks={openTasks} completedTasks={completedTasks} users={users} />
                    )}

                </div>
            </main>
            <MobileNav />
        </div>
    );
}
