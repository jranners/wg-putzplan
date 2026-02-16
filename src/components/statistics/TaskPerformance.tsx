import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

export function TaskPerformance({ metrics }: { metrics: any[] }) {
    return (
        <Card className="bg-[#000000] border-white/10 h-full">
            <CardHeader>
                <CardTitle className="text-white">Performance Übersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {metrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors -mx-2 px-2">
                        <div className="w-full">
                            <p className="text-xs font-bold uppercase tracking-widest text-[#13b6ec] mb-1">{metric.label}</p>
                            <div className="flex items-end justify-between">
                                <span className="text-3xl font-bold text-white tracking-tight">{metric.value}</span>
                                <span className={`flex items-center text-sm font-bold px-2 py-1 rounded ${metric.trend === 'up' ? 'text-emerald-400 bg-emerald-400/10' :
                                    metric.trend === 'down' ? 'text-rose-400 bg-rose-400/10' : 'text-white/40 bg-white/5'
                                    }`}>
                                    {metric.trend === 'up' && <TrendingUp className="mr-1.5 h-3.5 w-3.5" />}
                                    {metric.trend === 'down' && <TrendingDown className="mr-1.5 h-3.5 w-3.5" />}
                                    {metric.trend === 'neutral' && <Minus className="mr-1.5 h-3.5 w-3.5" />}
                                    {metric.change}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
