"use server";

import { db, inviteCodes, wgs, users, tasks, activities, expenses, shoppingItems, ledgers } from "@/lib/db";
import { eq, and, isNull, asc, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";

async function getAuthUser() {
    const user = await getCurrentUser();
    if (!user) throw new Error("Nicht eingeloggt");
    return user;
}

export async function verifyInviteCode(code: string): Promise<ActionResponse<{ wgId: string; wgName: string }>> {
    return actionWrapper(async () => {
        const invite = await db.query.inviteCodes.findFirst({
            where: eq(inviteCodes.code, code),
            with: { wg: true }
        });

        if (!invite) throw new Error("Ungültiger Einladungscode.");
        if (invite.usedBy) throw new Error("Dieser Code wurde bereits verwendet.");
        if (new Date() > invite.expiresAt) throw new Error("Dieser Code ist abgelaufen.");

        return { wgId: invite.wgId, wgName: (invite as any).wg.name };
    });
}

export async function registerUser(
    name: string,
    email: string,
    password: string,
    inviteCode: string,
    paypalMeHandle?: string,
    avatarBase64?: string
): Promise<ActionResponse> {
    return actionWrapper(async () => {
        if (!email || !password || !inviteCode) {
            throw new Error("Bitte alle Pflichtfelder ausfüllen.");
        }

        // 1. Validate Invite Code
        const invite = await db.query.inviteCodes.findFirst({
            where: eq(inviteCodes.code, inviteCode)
        });
        if (!invite || invite.usedBy) throw new Error("Einladungscode ungültig oder bereits verwendet.");
        if (new Date() > invite.expiresAt) throw new Error("Einladungscode abgelaufen.");

        // 2. Check Existing User
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });
        if (existingUser) {
            throw new Error("Benutzer mit dieser Email existiert bereits.");
        }

        // 3. Hash Password
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 12);

        // 4. Create User
        const userId = uuidv4();
        await db.insert(users).values({
            id: userId,
            name,
            email,
            password: hashedPassword,
            paypalMeHandle,
            image: avatarBase64 || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
        });

        // 5. Mark Invite Code as Used
        await db
            .update(inviteCodes)
            .set({ usedBy: userId })
            .where(eq(inviteCodes.id, invite.id));
    });
}

export async function registerUserAndWG(
    name: string,
    email: string,
    password: string,
    wgName: string,
    paypalMeHandle?: string,
    avatarBase64?: string,
    wgImageBase64?: string
): Promise<ActionResponse> {
    return actionWrapper(async () => {
        if (!email || !password || !wgName) {
            throw new Error("Bitte alle Pflichtfelder ausfüllen.");
        }

        // 1. Check Existing User
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email)
        });
        if (existingUser) {
            throw new Error("Benutzer mit dieser Email existiert bereits.");
        }

        // 2. Hash Password
        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Execution in Transaction
        return await db.transaction(async (tx) => {
            const userId = uuidv4();
            const wgId = uuidv4();
            const ledgerId = uuidv4();
            const inviteCodeId = uuidv4();

            // A. Create User (Role: Admin)
            await tx.insert(users).values({
                id: userId,
                name,
                email,
                password: hashedPassword,
                role: "admin",
                paypalMeHandle,
                image: avatarBase64 || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || email)}`,
            });

            // B. Create WG
            await tx.insert(wgs).values({
                id: wgId,
                name: wgName,
                adminId: userId,
                image: wgImageBase64 || null,
            });

            // C. Create Ledger
            await tx.insert(ledgers).values({
                id: ledgerId,
                wgId: wgId,
                balance: 0,
            });

            // D. Generate Initial Invite Code
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            await tx.insert(inviteCodes).values({
                id: inviteCodeId,
                code: `${wgName.substring(0, 3).toUpperCase()}-${code}`,
                wgId: wgId,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
            });

            return undefined;
        });
    });
}

// ─── Response Types ──────────────────────────────────────────────

export type ActionResponse<T = void> =
    | { success: true; data: T }
    | { success: false; error: string };

export interface Debt {
    userId: string;
    userName: string;
    avatarUrl?: string | null;
    paypalMeHandle?: string | null;
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
    lastCompleted?: string | null;
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
    paypalMeHandle?: string | null;
};

export type WGInfo = {
    id: string;
    name: string;
    adminId: string;
    image?: string | null;
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
    currentUserId: string;
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

function serializeDate(d: Date | null | undefined): string {
    if (!d || isNaN(new Date(d).getTime())) return new Date().toISOString();
    return new Date(d).toISOString();
}

// ─── DASHBOARD ──────────────────────────────────────────────

export async function getDashboardData(): Promise<ActionResponse<DashboardData>> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();

        const [dbTasks, dbActivities, dbExpenses, dbUsers] = await Promise.all([
            db.query.tasks.findMany({
                where: and(
                    eq(tasks.isDone, false),
                    eq(tasks.assigneeId, currentUserId)
                ),
            }),
            db.query.activities.findMany({
                orderBy: [desc(activities.timestamp)],
            }),
            db.query.expenses.findMany(),
            db.query.users.findMany(),
        ]);

        // Sort tasks by priority (high → normal → low)
        const priorityOrder: Record<string, number> = { high: 0, normal: 1, low: 2 };
        const sortedTasks = [...dbTasks].sort((a, b) => (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1));

        const income = dbExpenses.filter(e => e.category === "rent").reduce((sum, e) => sum + e.amount, 0);
        const fixed = dbExpenses.filter(e => e.category === "utilities").reduce((sum, e) => sum + e.amount, 0);
        const maintenance = dbExpenses.filter(e => e.category === "maintenance").reduce((sum, e) => sum + e.amount, 0);

        const debts = calculateDebts(currentUserId, dbExpenses, dbUsers);
        const netDebts = debts.reduce((sum, d) => sum + d.amount, 0);
        const total = netDebts;
        const buffer = total > 0 ? total * 0.1 : 0;

        return {
            tasks: sortedTasks.map(t => ({
                id: t.id,
                title: t.title,
                details: t.details,
                priority: t.priority,
                dueDate: serializeDate(t.dueDate),
                isDone: t.isDone || false,
                rotation: t.rotation,
                assigneeId: t.assigneeId,
                lastCompleted: t.lastCompleted ? serializeDate(t.lastCompleted) : null,
            })),
            activities: dbActivities.map(a => ({
                id: a.id,
                title: a.title,
                meta: a.meta,
                type: a.type,
                timestamp: serializeDate(a.timestamp),
            })),
            finances: { total, income, fixed, maintenance, buffer },
            debts,
            users: dbUsers.map(u => ({
                id: u.id,
                name: u.name || "Unbekannt",
                role: u.role,
                avatarUrl: u.avatarUrl,
                paypalMeHandle: u.paypalMeHandle
            }))
        };
    });
}

// ─── TASKS ──────────────────────────────────────────────

export async function toggleTaskStatus(taskId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const task = await db.query.tasks.findFirst({ where: eq(tasks.id, taskId) });
        if (!task) throw new Error("Aufgabe nicht gefunden");

        // STRICT PERMISSION CHECK
        const { id: currentUserId } = await getAuthUser();
        if (task.assigneeId && task.assigneeId !== currentUserId) {
            throw new Error("Du kannst nur deine eigenen Aufgaben erledigen.");
        }

        const wasDone = task.isDone;
        const now = new Date();

        await db
            .update(tasks)
            .set({
                isDone: !task.isDone,
                lastCompleted: !wasDone ? now : task.lastCompleted
            })
            .where(eq(tasks.id, taskId));

        // If marking as done and has rotation, create next occurrence
        if (!wasDone && task.rotation && task.rotation !== "none") {
            let nextDueDate = new Date(); // Start from completion date
            let turnusDays = 0;

            switch (task.rotation) {
                case "daily":
                    turnusDays = 1;
                    break;
                case "weekly":
                    turnusDays = 7;
                    break;
                case "biweekly":
                    turnusDays = 14;
                    break;
                case "monthly":
                    turnusDays = 30;
                    break;
                default:
                    turnusDays = task.turnusDays || 7;
            }

            // Calculate next due date
            nextDueDate.setDate(nextDueDate.getDate() + turnusDays);

            // Round Robin Assignment
            let nextAssigneeId = task.assigneeId;
            if (task.assigneeId) {
                const dbUsers = await db.query.users.findMany({ orderBy: [asc(users.name)] });
                const currentIndex = dbUsers.findIndex(u => u.id === task.assigneeId);
                if (currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % dbUsers.length;
                    nextAssigneeId = dbUsers[nextIndex].id;
                }
            }

            await db.insert(tasks).values({
                id: uuidv4(),
                title: task.title,
                details: task.details,
                priority: task.priority,
                rotation: task.rotation,
                dueDate: nextDueDate,
                isDone: false,
                assigneeId: nextAssigneeId,
                turnusDays: turnusDays,
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
        let turnusDays = 0;
        if (data.rotation) {
            switch (data.rotation) {
                case "daily": turnusDays = 1; break;
                case "weekly": turnusDays = 7; break;
                case "biweekly": turnusDays = 14; break;
                case "monthly": turnusDays = 30; break;
            }
        }

        await db.insert(tasks).values({
            id: uuidv4(),
            title: data.title,
            details: data.details,
            priority: data.priority,
            dueDate: new Date(data.dueDate),
            rotation: data.rotation || "none",
            isDone: false,
            assigneeId: data.assigneeId || null,
            turnusDays: turnusDays > 0 ? turnusDays : null,
        });

        await db.insert(activities).values({
            id: uuidv4(),
            title: `Aufgabe erstellt: ${data.title}`,
            meta: "Neu hinzugefügt",
            type: "info",
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
        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.details !== undefined) updateData.details = updates.details;
        if (updates.priority !== undefined) updateData.priority = updates.priority;
        if (updates.dueDate !== undefined) updateData.dueDate = new Date(updates.dueDate);
        if (updates.rotation !== undefined) updateData.rotation = updates.rotation;
        if (updates.isDone !== undefined) updateData.isDone = updates.isDone;
        if (updates.assigneeId !== undefined) updateData.assigneeId = updates.assigneeId || null;

        await db.update(tasks).set(updateData).where(eq(tasks.id, taskId));
        revalidatePath("/");
        revalidatePath("/tasks");
    });
}

export async function getTasks(): Promise<TaskData[]> {
    const dbTasks = await db.query.tasks.findMany({
        orderBy: [asc(tasks.dueDate)],
    });
    return dbTasks.map(t => ({
        id: t.id,
        title: t.title,
        details: t.details,
        priority: t.priority,
        dueDate: serializeDate(t.dueDate),
        isDone: t.isDone || false,
        rotation: t.rotation,
        assigneeId: t.assigneeId,
        lastCompleted: t.lastCompleted ? serializeDate(t.lastCompleted) : null,
    }));
}

// ─── EXPENSES ──────────────────────────────────────────────

export async function addExpense(expense: {
    title: string;
    amount: number;
    category: string;
    date: string;
    split: string;
}): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();
        await db.insert(expenses).values({
            id: uuidv4(),
            title: expense.title,
            amount: expense.amount,
            category: expense.category,
            date: new Date(expense.date),
            payerId: currentUserId,
            split: expense.split,
            transactionType: "EXPENSE",
        });
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

export async function settleDebt(toUserId: string, amount: number): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();
        const recipient = await db.query.users.findFirst({ where: eq(users.id, toUserId) });
        if (!recipient) throw new Error("Empfänger nicht gefunden");

        await db.insert(expenses).values({
            id: uuidv4(),
            title: `Ausgleich: ${recipient.name}`,
            amount,
            payerId: currentUserId,
            recipientId: toUserId,
            transactionType: "SETTLEMENT",
            date: new Date(),
            category: "other",
            split: "equal",
        });

        await db.insert(activities).values({
            id: uuidv4(),
            title: "Schulden beglichen",
            meta: `An ${recipient.name} ausgeglichen`,
            type: "finance",
        });

        revalidatePath("/");
        revalidatePath("/expenses");
    });
}

export async function getExpenses(): Promise<ExpenseData[]> {
    const dbExpenses = await db.query.expenses.findMany({
        orderBy: [desc(expenses.date)],
    });
    return dbExpenses.map(e => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        date: serializeDate(e.date),
        split: e.split,
        category: e.category,
        transactionType: e.transactionType,
        payerId: e.payerId,
        recipientId: e.recipientId,
    }));
}

export async function deleteExpense(expenseId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();

        const expense = await db.query.expenses.findFirst({
            where: eq(expenses.id, expenseId)
        });

        if (!expense) throw new Error("Ausgabe nicht gefunden.");

        // Security Check: Only the payer can delete their expense
        if (expense.payerId !== currentUserId) {
            throw new Error("Sicherheitsfehler: Du kannst nur deine eigenen Ausgaben löschen.");
        }

        await db.delete(expenses).where(eq(expenses.id, expenseId));
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

export async function resetWGData(): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();

        // Find WG where user is admin
        const wg = await db.query.wgs.findFirst({
            where: eq(wgs.adminId, currentUserId)
        });

        if (!wg) throw new Error("Nur der WG-Admin kann die Daten zurücksetzen.");

        // Find all users associated with this WG via invite codes
        const invites = await db.query.inviteCodes.findMany({
            where: eq(inviteCodes.wgId, wg.id),
        });

        const userIdsToDelete = Array.from(new Set(invites.map(i => i.usedBy).filter(Boolean) as string[]));
        if (!userIdsToDelete.includes(currentUserId)) {
            userIdsToDelete.push(currentUserId);
        }

        return await db.transaction(async (tx) => {
            // 1. Wipe all transactional data
            await tx.delete(expenses);
            await tx.delete(tasks);
            await tx.delete(activities);
            await tx.delete(shoppingItems);

            // 2. Wipe WG infrastructure
            await tx.delete(inviteCodes).where(eq(inviteCodes.wgId, wg.id));
            await tx.delete(ledgers).where(eq(ledgers.wgId, wg.id));
            await tx.delete(wgs).where(eq(wgs.id, wg.id));

            // 3. Wipe all users associated with the WG
            for (const userId of userIdsToDelete) {
                await tx.delete(users).where(eq(users.id, userId));
            }

            return undefined;
        });
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
        const updateData: any = {};
        if (updates.title !== undefined) updateData.title = updates.title;
        if (updates.amount !== undefined) updateData.amount = updates.amount;
        if (updates.category !== undefined) updateData.category = updates.category;
        if (updates.date !== undefined) updateData.date = new Date(updates.date);
        if (updates.split !== undefined) updateData.split = updates.split;

        await db.update(expenses).set(updateData).where(eq(expenses.id, expenseId));
        revalidatePath("/expenses");
        revalidatePath("/");
    });
}

// ─── DEBT CALCULATION ──────────────────────────────────────────────

function calculateDebts(
    currentUserId: string,
    expensesList: { payerId: string; recipientId: string | null; amount: number; transactionType: string }[],
    usersList: { id: string; name: string | null; avatarUrl: string | null; paypalMeHandle?: string | null }[]
): Debt[] {
    const balances: Record<string, number> = {};
    usersList.forEach(u => u.id !== currentUserId && (balances[u.id] = 0));

    expensesList.forEach(expense => {
        const type = expense.transactionType || "EXPENSE";

        if (type === "SETTLEMENT") {
            if (expense.payerId === currentUserId && expense.recipientId) {
                balances[expense.recipientId] = (balances[expense.recipientId] || 0) + expense.amount;
            } else if (expense.recipientId === currentUserId) {
                balances[expense.payerId] = (balances[expense.payerId] || 0) - expense.amount;
            }
        } else {
            const numberOfUsers = usersList.length;
            if (numberOfUsers === 0) return;
            const splitAmount = expense.amount / numberOfUsers;
            if (expense.payerId === currentUserId) {
                usersList.forEach(u => u.id !== currentUserId && (balances[u.id] = (balances[u.id] || 0) + splitAmount));
            } else {
                balances[expense.payerId] = (balances[expense.payerId] || 0) - splitAmount;
            }
        }
    });

    return usersList
        .filter(u => u.id !== currentUserId)
        .map(u => ({
            userId: u.id,
            userName: u.name || "Unbekannt",
            avatarUrl: u.avatarUrl,
            paypalMeHandle: u.paypalMeHandle,
            amount: balances[u.id] || 0
        }))
        .filter(d => Math.abs(d.amount) > 0.01);
}

export async function getDebts(currentUserId: string): Promise<Debt[]> {
    const [dbExpenses, dbUsers] = await Promise.all([
        db.query.expenses.findMany(),
        db.query.users.findMany(),
    ]);
    return calculateDebts(currentUserId, dbExpenses, dbUsers);
}

// ─── USERS ──────────────────────────────────────────────

export async function getUsers(): Promise<UserData[]> {
    const dbUsers = await db.query.users.findMany();
    return dbUsers.map(u => ({
        id: u.id,
        name: u.name || "Unbekannt",
        role: u.role,
        avatarUrl: u.avatarUrl,
        paypalMeHandle: u.paypalMeHandle,
    }));
}

// ─── SHOPPING ──────────────────────────────────────────────

export async function getShoppingItems(): Promise<ShoppingItemData[]> {
    const items = await db.query.shoppingItems.findMany({
        orderBy: [desc(shoppingItems.createdAt)],
    });
    return items.map(i => ({
        id: i.id,
        title: i.title,
        isBought: i.isBought || false,
        addedBy: i.addedById,
        createdAt: serializeDate(i.createdAt),
    }));
}

export async function addShoppingItem(title: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: userId } = await getAuthUser();
        await db.insert(shoppingItems).values({
            id: uuidv4(),
            title,
            isBought: false,
            addedById: userId,
        });
        revalidatePath("/shopping");
    });
}

export async function toggleShoppingItem(itemId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const item = await db.query.shoppingItems.findFirst({ where: eq(shoppingItems.id, itemId) });
        if (!item) throw new Error("Artikel nicht gefunden");

        await db
            .update(shoppingItems)
            .set({ isBought: !item.isBought })
            .where(eq(shoppingItems.id, itemId));
        revalidatePath("/shopping");
    });
}

export async function deleteShoppingItem(itemId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        await db.delete(shoppingItems).where(eq(shoppingItems.id, itemId));
        revalidatePath("/shopping");
    });
}

// ─── WG MANAGEMENT ──────────────────────────────────────────────

export async function getWGData(): Promise<ActionResponse<WGData>> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();
        const [dbWg, dbUsers, dbInviteCodes] = await Promise.all([
            db.query.wgs.findFirst(),
            db.query.users.findMany(),
            db.query.inviteCodes.findMany({
                where: isNull(inviteCodes.usedBy),
            }),
        ]);

        return {
            wg: dbWg ? { id: dbWg.id, name: dbWg.name, adminId: dbWg.adminId, image: dbWg.image } : null,
            members: dbUsers.map(u => ({
                id: u.id,
                name: u.name || "Unbekannt",
                role: u.role,
                avatarUrl: u.avatarUrl,
                paypalMeHandle: u.paypalMeHandle
            })),
            inviteCodes: dbInviteCodes.map(c => ({
                id: c.id,
                code: c.code,
                wgId: c.wgId,
                usedBy: c.usedBy,
                createdAt: serializeDate(c.createdAt),
                expiresAt: serializeDate(c.expiresAt),
            })),
            currentUserId,
        };
    });
}

export async function kickMember(userId: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();
        const wg = await db.query.wgs.findFirst();
        if (wg?.adminId !== currentUserId) {
            throw new Error("Nur der Admin kann Mitglieder entfernen.");
        }
        if (userId === currentUserId) {
            throw new Error("Du kannst dich nicht selbst entfernen.");
        }

        await db.delete(users).where(eq(users.id, userId));
        revalidatePath("/settings");
        revalidatePath("/");
    });
}

export async function generateInviteCode(): Promise<ActionResponse<InviteCodeData>> {
    return actionWrapper(async () => {
        const { id: currentUserId } = await getAuthUser();
        const wg = await db.query.wgs.findFirst();
        if (!wg || wg.adminId !== currentUserId) {
            throw new Error("Nur der Admin kann Einladungscodes erstellen.");
        }

        const digits = Math.floor(100000 + Math.random() * 900000).toString();
        const codeValue = `${wg.id}-${digits}`;
        const id = uuidv4();
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        await db.insert(inviteCodes).values({
            id,
            code: codeValue,
            wgId: wg.id,
            expiresAt,
        });

        revalidatePath("/settings");
        return {
            id,
            code: codeValue,
            wgId: wg.id,
            usedBy: null,
            createdAt: serializeDate(new Date()),
            expiresAt: serializeDate(expiresAt),
        };
    });
}

export async function updateWGImage(imageBase64: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: userId } = await getAuthUser();
        const wg = await db.query.wgs.findFirst();
        if (!wg || wg.adminId !== userId) {
            throw new Error("Nur der Admin kann das WG-Bild ändern.");
        }

        await db
            .update(wgs)
            .set({ image: imageBase64 })
            .where(eq(wgs.id, wg.id));

        revalidatePath("/management");
        revalidatePath("/");
    });
}

export async function updatePayPalHandle(handle: string): Promise<ActionResponse> {
    return actionWrapper(async () => {
        const { id: userId } = await getAuthUser();
        await db
            .update(users)
            .set({ paypalMeHandle: handle })
            .where(eq(users.id, userId));
        revalidatePath("/settings");
    });
}

// ─── DEV TOOLS ──────────────────────────────────────────────

export async function saveUserCookie(userId: string) {
    if (process.env.NODE_ENV === "production") return;
    console.warn("saveUserCookie is deprecated via NextAuth");
    revalidatePath("/");
}
