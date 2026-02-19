'use server'

import { db, users, tasks } from '@/lib/db'
import { eq, and, isNotNull } from 'drizzle-orm'

export interface CleaningStatistic {
    name: string
    value: number
    color: string
}

export interface TaskPerformanceMetric {
    label: string
    value: string | number
    change?: string
    trend?: 'up' | 'down' | 'neutral'
}

export async function getCleaningStatistics() {
    const [dbUsers, allTasks] = await Promise.all([
        db.query.users.findMany(),
        db.query.tasks.findMany(),
    ]);

    const totalTasks = allTasks.length;
    const doneTasks = allTasks.filter(t => t.isDone);
    const colors = ['#13B6EC', '#94A3B8', '#475569', '#334155'];

    // Contribution: count completed tasks per user (or unassigned)
    const contributionData: CleaningStatistic[] = dbUsers.map((user, i) => {
        const userTasks = doneTasks.filter(t => t.assigneeId === user.id).length;

        return {
            name: user.name || "Unbekannt",
            value: totalTasks > 0 ? Math.round((userTasks / Math.max(doneTasks.length, 1)) * 100) : 0,
            color: colors[i % colors.length],
        };
    });

    // If no tasks have assignees, show even split
    const hasAssigned = contributionData.some(c => c.value > 0);
    if (!hasAssigned && dbUsers.length > 0) {
        const even = Math.round(100 / dbUsers.length);
        contributionData.forEach((c, i) => {
            c.value = i === 0 ? 100 - even * (dbUsers.length - 1) : even;
        });
    }

    const onTimeCount = doneTasks.length;
    const missedCount = allTasks.filter(t => !t.isDone && new Date(t.dueDate) < new Date()).length;
    const total = onTimeCount + missedCount;
    const onTimeRate = total > 0 ? Math.round((onTimeCount / total) * 100) : 100;

    const performanceMetrics: TaskPerformanceMetric[] = [
        { label: 'Tasks Completed', value: doneTasks.length, trend: 'up' },
        { label: 'On-Time Rate', value: `${onTimeRate}%`, trend: onTimeRate >= 80 ? 'up' : 'down' },
        { label: 'Missed Tasks', value: missedCount, trend: missedCount <= 2 ? 'up' : 'down' },
    ];

    // Weekly activity (last 7 days)
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const weeklyActivity = dayNames.map((name, i) => {
        const dayStart = new Date(now);
        dayStart.setDate(now.getDate() - now.getDay() + i + 1);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const completed = doneTasks.filter(t => {
            const d = new Date(t.dueDate);
            return d >= dayStart && d < dayEnd;
        }).length;

        return { name, completed };
    });

    return {
        contributionData,
        performanceMetrics,
        weeklyActivity,
    }
}
