"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ─── Response Types ──────────────────────────────────────────────

export type ActionResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

export interface Debt {
    userId: string;
    userName: string;
    avatarUrl?: string | null;
    amount: number;
}

export interface DashboardData {
    tasks: TaskData[];
    activities: ActivityData[];
    finances: {
        total: number;
        income: number;
        fixed: number;
        maintenance: number;
        buffer: number;
    };
    debts: Debt[];
    users: UserData[];
}

// Plain data types (serializable from Prisma models)
export type TaskData = {
    id: string;
    title: string;
    details: string;
    priority: string;
    dueDate: string;
    isDone: boolean;
    rotation: string;
    assigneeId: string | null;
};

export type ExpenseData = {
    id: string;
    title: string;
    amount: number;
    date: string;
    split: string;
    category: string;
    transactionType: string;
    payerId: string;
    recipientId: string | null;
};

export type ActivityData = {
    id: string;
    title: string;
    meta: string;
    type: string;
    timestamp: string;
};

export type ShoppingItemData = {
    id: string;
    title: string;
    isBought: boolean;
    addedBy: string;
    createdAt: string;
};

export type UserData = {
    id: string;
    name: string;
    role: string;
    avatarUrl: string | null;
};

export type WGInfo = {
    id: string;
    name: string;
    adminId: string;
};

export type InviteCodeData = {
    id: string;
    code: string;
    wgId: string;
    usedBy: string | null;
    createdAt: string;
    expiresAt: string;
};

export interface WGData {
    wg: WGInfo | null;
    members: UserData[];
    inviteCodes: InviteCodeData[];
}

// ─── Helpers ──────────────────────────────────────────────

async function actionWrapper<T>(action: () => Promise<T>): Promise<ActionResponse<T>> {
    try {
        const data = await action();
        return { success: true, data };
    } catch (error) {
        console.error("Action error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Ein unerwarteter Fehler ist aufgetreten."
        };
    }
}

function serializeDate(d: Date): string {
    return d.toISOString();
}

// ─── DASHBOARD ──────────────────────────────────────────────

export async function getDashboardData(): Promise<ActionResponse<DashboardData>> {
    return actionWrapper(async () => {
        const currentUserId = "1";

        const [tasks, activities, expenses, users] = await Promise.all([
            prisma.task.findMany({
                where: { isDone: false },
                orderBy: { priority: "asc" },
            }),
            prisma.activity.findMany({
                orderBy: { timestamp: "desc" },
            }),
            prisma.expense.findMany(),
            prisma.user.findMany(),
        ]);

        // Sort tasks by priority (high → normal → low)
        const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
        const sortedTasks = tasks.sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));

        const income = expenses.filter(e => e.category === "rent").reduce((sum, e) => sum + e.amount, 0);
        const fixed = expenses.filter(e => e.category === "utilities").reduce((sum, e) => sum + e.amount, 0);
        const maintenance = expenses.filter(e => e.category === "maintenance").reduce((sum, e) => sum + e.amount, 0);

        const debts = calculateDebts(currentUserId, expenses, users);
        const netDebts = debts.reduce((sum, d) => sum + d.amount, 0);
        const total = 5000 + netDebts;
        const buffer = total > 1000 ? total - 1000 : 0;

        return {
            tasks: sortedTasks.map(t => ({
                ...t,
                dueDate: serializeDate(t.dueDate),
                assigneeId: t.assigneeId,
            })),
            activities: activities.map(a => ({
                ...a,
                timestamp: serializeDate(a.timestamp),
            })),
            finances: { total, income, fixed, maintenance, buffer },
            debts,
            users: users.map(u => ({
                id: u.id,
                name: u.name,
                role: u.role,
                avatarUrl: u.avatarUrl
            }))
        };
    });
}

// ─── TASKS ──────────────────────────────────────────────

export async function toggleTaskStatus(taskId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new Error("Aufgabe nicht gefunden");

        const wasDone = task.isDone;
        await prisma.task.update({
            where: { id: taskId },
            data: { isDone: !task.isDone },
        });

        // If marking as done and has rotation, create next occurrence
        if (!wasDone && task.rotation && task.rotation !== "none") {
            const nextDueDate = new Date(task.dueDate);
            switch (task.rotation) {
                case "daily": nextDueDate.setDate(nextDueDate.getDate() + 1); break;
                case "weekly": nextDueDate.setDate(nextDueDate.getDate() + 7); break;
                case "biweekly": nextDueDate.setDate(nextDueDate.getDate() + 14); break;
                case "monthly": nextDueDate.setMonth(nextDueDate.getMonth() + 1); break;
            }

            await prisma.task.create({
                data: {
                    title: task.title,
                    details: task.details,
                    priority: task.priority,
                    rotation: task.rotation,
                    dueDate: nextDueDate,
                    isDone: false,
                    assigneeId: task.assigneeId,
                },
            });
        }

        revalidatePath("/");
        revalidatePath("/tasks");
    });
}

export async function createTask(data: {
    title: string;
    details: string;
    priority: string;
    dueDate: string;
    rotation?: string;
    assigneeId?: string;
}): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await prisma.task.create({
            data: {
                title: data.title,
                details: data.details,
                priority: data.priority,
                dueDate: new Date(data.dueDate),
                rotation: data.rotation || "none",
                isDone: false,
                assigneeId: data.assigneeId,
            },
        });

        await prisma.activity.create({
            data: {
                title: `Aufgabe erstellt: ${data.title}`,
                meta: "Neu hinzugefügt",
                type: "info",
            },
        });

        revalidatePath("/");
        revalidatePath("/tasks");
    });
}

export async function updateTask(taskId: string, updates: Partial<{
    title: string;
    details: string;
    priority: string;
    dueDate: string;
    rotation: string;
    isDone: boolean;
    assigneeId: string;
}>): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const data: Prisma.TaskUpdateInput = {};
        if (updates.title !== undefined) data.title = updates.title;
        if (updates.details !== undefined) data.details = updates.details;
        if (updates.priority !== undefined) data.priority = updates.priority;
        if (updates.dueDate !== undefined) data.dueDate = new Date(updates.dueDate);
        if (updates.rotation !== undefined) data.rotation = updates.rotation;
        if (updates.isDone !== undefined) data.isDone = updates.isDone;
        if (updates.assigneeId !== undefined) {
            data.assignee = updates.assigneeId
                ? { connect: { id: updates.assigneeId } }
                : { disconnect: true };
        }

        await prisma.task.update({ where: { id: taskId }, data });
        revalidatePath("/");
        revalidatePath("/tasks");
    });
}

export async function getTasks(): Promise<TaskData[]> {
    const tasks = await prisma.task.findMany({
        orderBy: { dueDate: "asc" },
    });
    return tasks.map(t => ({
        ...t,
        dueDate: serializeDate(t.dueDate),
        assigneeId: t.assigneeId,
    }));
}

// ─── EXPENSES ──────────────────────────────────────────────

export async function addExpense(expense: {
    title: string;
    amount: number;
    category: string;
    date: string;
    payerId: string;
    split: string;
}): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await prisma.expense.create({
            data: {
                title: expense.title,
                amount: expense.amount,
                category: expense.category,
                date: new Date(expense.date),
                payerId: expense.payerId,
                split: expense.split,
            },
        });
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

export async function settleDebt(toUserId: string, amount: number): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const currentUserId = "1";
        const recipient = await prisma.user.findUnique({ where: { id: toUserId } });
        if (!recipient) throw new Error("Empfänger nicht gefunden");

        await prisma.expense.create({
            data: {
                title: `Ausgleich: ${recipient.name}`,
                amount,
                payerId: currentUserId,
                recipientId: toUserId,
                transactionType: "SETTLEMENT",
                date: new Date(),
                category: "other",
                split: "equal",
            },
        });

        await prisma.activity.create({
            data: {
                title: "Schulden beglichen",
                meta: `An ${recipient.name} ausgeglichen`,
                type: "finance",
            },
        });

        revalidatePath("/");
        revalidatePath("/expenses");
    });
}

export async function getExpenses(): Promise<ExpenseData[]> {
    const expenses = await prisma.expense.findMany({
        orderBy: { date: "desc" },
    });
    return expenses.map(e => ({
        ...e,
        date: serializeDate(e.date),
    }));
}

export async function deleteExpense(expenseId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await prisma.expense.delete({ where: { id: expenseId } });
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

export async function updateExpense(expenseId: string, updates: Partial<{
    title: string;
    amount: number;
    category: string;
    date: string;
    split: string;
}>): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const data: Prisma.ExpenseUpdateInput = {};
        if (updates.title !== undefined) data.title = updates.title;
        if (updates.amount !== undefined) data.amount = updates.amount;
        if (updates.category !== undefined) data.category = updates.category;
        if (updates.date !== undefined) data.date = new Date(updates.date);
        if (updates.split !== undefined) data.split = updates.split;

        await prisma.expense.update({ where: { id: expenseId }, data });
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

// ─── DEBT CALCULATION ──────────────────────────────────────────────

function calculateDebts(
    currentUserId: string,
    expenses: { payerId: string; recipientId: string | null; amount: number; transactionType: string }[],
    users: { id: string; name: string; avatarUrl: string | null }[]
): Debt[] {
    const balances: Record<string, number> = {};
    users.forEach(u => u.id !== currentUserId && (balances[u.id] = 0));

    expenses.forEach(expense => {
        const type = expense.transactionType || "EXPENSE";

        if (type === "SETTLEMENT") {
            if (expense.payerId === currentUserId && expense.recipientId) {
                balances[expense.recipientId] = (balances[expense.recipientId] || 0) + expense.amount;
            } else if (expense.recipientId === currentUserId) {
                balances[expense.payerId] = (balances[expense.payerId] || 0) - expense.amount;
            }
        } else {
            const numberOfUsers = users.length;
            if (numberOfUsers === 0) return;
            const splitAmount = expense.amount / numberOfUsers;
            if (expense.payerId === currentUserId) {
                users.forEach(u => u.id !== currentUserId && (balances[u.id] = (balances[u.id] || 0) + splitAmount));
            } else {
                balances[expense.payerId] = (balances[expense.payerId] || 0) - splitAmount;
            }
        }
    });

    return users
        .filter(u => u.id !== currentUserId)
        .map(u => ({ userId: u.id, userName: u.name, avatarUrl: u.avatarUrl, amount: balances[u.id] || 0 }))
        .filter(d => Math.abs(d.amount) > 0.01);
}

export async function getDebts(currentUserId: string): Promise<Debt[]> {
    const [expenses, users] = await Promise.all([
        prisma.expense.findMany(),
        prisma.user.findMany(),
    ]);
    return calculateDebts(currentUserId, expenses, users);
}

// ─── USERS ──────────────────────────────────────────────

export async function getUsers(): Promise<UserData[]> {
    const users = await prisma.user.findMany();
    return users.map(u => ({
        id: u.id,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl,
    }));
}

// ─── SHOPPING ──────────────────────────────────────────────

export async function getShoppingItems(): Promise<ShoppingItemData[]> {
    const items = await prisma.shoppingItem.findMany({
        orderBy: { createdAt: "desc" },
    });
    return items.map(i => ({
        id: i.id,
        title: i.title,
        isBought: i.isBought,
        addedBy: i.addedById,
        createdAt: serializeDate(i.createdAt),
    }));
}

export async function addShoppingItem(title: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await prisma.shoppingItem.create({
            data: {
                title,
                isBought: false,
                addedById: "1",
            },
        });
        revalidatePath("/shopping");
    });
}

export async function toggleShoppingItem(itemId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const item = await prisma.shoppingItem.findUnique({ where: { id: itemId } });
        if (!item) throw new Error("Artikel nicht gefunden");

        await prisma.shoppingItem.update({
            where: { id: itemId },
            data: { isBought: !item.isBought },
        });
        revalidatePath("/shopping");
    });
}

export async function deleteShoppingItem(itemId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await prisma.shoppingItem.delete({ where: { id: itemId } });
        revalidatePath("/shopping");
    });
}

// ─── WG MANAGEMENT ──────────────────────────────────────────────

export async function getWGData(): Promise<ActionResponse<WGData>> {
    return actionWrapper(async () => {
        const [wg, users, inviteCodes] = await Promise.all([
            prisma.wG.findFirst(),
            prisma.user.findMany(),
            prisma.inviteCode.findMany({
                where: { usedBy: null },
            }),
        ]);

        return {
            wg: wg ? { id: wg.id, name: wg.name, adminId: wg.adminId } : null,
            members: users.map(u => ({
                id: u.id,
                name: u.name,
                role: u.role,
                avatarUrl: u.avatarUrl,
            })),
            inviteCodes: inviteCodes.map(c => ({
                id: c.id,
                code: c.code,
                wgId: c.wgId,
                usedBy: c.usedBy,
                createdAt: serializeDate(c.createdAt),
                expiresAt: serializeDate(c.expiresAt),
            })),
        };
    });
}

export async function kickMember(userId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const currentUserId = "1";
        const wg = await prisma.wG.findFirst();
        if (wg?.adminId !== currentUserId) {
            throw new Error("Nur der Admin kann Mitglieder entfernen.");
        }
        if (userId === currentUserId) {
            throw new Error("Du kannst dich nicht selbst entfernen.");
        }

        await prisma.user.delete({ where: { id: userId } });
        revalidatePath("/settings");
        revalidatePath("/");
    });
}

export async function generateInviteCode(): Promise<ActionResponse<InviteCodeData>> {
    return actionWrapper(async () => {
        const currentUserId = "1";
        const wg = await prisma.wG.findFirst();
        if (!wg || wg.adminId !== currentUserId) {
            throw new Error("Nur der Admin kann Einladungscodes erstellen.");
        }

        const digits = Math.floor(100000 + Math.random() * 900000).toString();
        const code = await prisma.inviteCode.create({
            data: {
                code: `${wg.id}-${digits}`,
                wgId: wg.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });

        revalidatePath("/settings");
        return {
            id: code.id,
            code: code.code,
            wgId: code.wgId,
            usedBy: code.usedBy,
            createdAt: serializeDate(code.createdAt),
            expiresAt: serializeDate(code.expiresAt),
        };
    });
}
