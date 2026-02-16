"use client"

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Sector
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;

    return (
        <g>
            <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#FFFFFF" className="text-2xl font-bold">
                {payload.name}
            </text>
            <text x={cx} y={cy + 24} dy={8} textAnchor="middle" fill="#FFFFFF40" className="text-sm">
                {value}%
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
        </g>
    );
};

export function StatisticsCharts({
    contributionData,
    weeklyActivity,
}: {
    contributionData: any[]
    weeklyActivity: any[]
}) {
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    return (
        <div className="space-y-6">
            <Card className="bg-[#000000] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Beitrag</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    // @ts-ignore
                                    activeIndex={activeIndex}
                                    activeShape={renderActiveShape}
                                    data={contributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                    onMouseEnter={onPieEnter}
                                >
                                    {contributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0)" />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-6">
                        {contributionData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span className="text-sm font-medium text-white/60">
                                    {entry.name} <span className="text-white font-bold ml-1">{entry.value}%</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-[#000000] border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Wöchentliche Aktivität</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center overflow-x-auto">
                    <div className="min-w-[500px] md:min-w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyActivity}>
                                <XAxis
                                    dataKey="name"
                                    stroke="#333"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#333"
                                    tick={{ fill: '#666', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: "rgba(255, 255, 255, 0.03)" }}
                                    contentStyle={{
                                        backgroundColor: "#000000",
                                        borderColor: "rgba(255,255,255,0.1)",
                                        color: "#fff",
                                        borderRadius: "8px",
                                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)"
                                    }}
                                />
                                <Bar
                                    dataKey="completed"
                                    fill="#13B6EC"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
