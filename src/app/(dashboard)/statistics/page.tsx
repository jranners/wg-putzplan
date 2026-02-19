import { getCleaningStatistics } from '@/actions/statistics'
import { StatisticsCharts } from '@/components/statistics/StatisticsCharts'
import { TaskPerformance } from '@/components/statistics/TaskPerformance'
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNav } from '@/components/layout/MobileNav';

export default async function StatisticsPage() {
    const data = await getCleaningStatistics()

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-[#000000] p-6 lg:p-10 pb-32 lg:pb-10">
                <div className="mx-auto max-w-7xl space-y-8">
                    <div className="flex flex-col space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Statistik</h1>
                            <p className="text-white/40">Alle Zahlen und Fakten im Überblick.</p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                            <div className="col-span-4 lg:col-span-4">
                                <StatisticsCharts
                                    contributionData={data.contributionData}
                                    weeklyActivity={data.weeklyActivity}
                                />
                            </div>
                            <div className="col-span-3 lg:col-span-3">
                                <TaskPerformance metrics={data.performanceMetrics} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <MobileNav />
        </div>
    )
}
