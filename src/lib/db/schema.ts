import { pgTable, text, timestamp, integer, boolean, doublePrecision, primaryKey } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";

export const users = pgTable("User", {
    id: text("id").primaryKey(),
    name: text("name"),
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    role: text("role").notNull().default("member"),
    avatarUrl: text("avatarUrl"),
    password: text("password"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    personalBalance: doublePrecision("personalBalance").notNull().default(0),
    paypalEmail: text("paypalEmail").unique(),
    paypalName: text("paypalName"),
    paypalMeHandle: text("paypalMeHandle"),
    paypalMe: text("paypalMe"),
    payerId: text("payerId"),
});

export const accounts = pgTable("Account", {
    id: text("id").primaryKey(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
});

export const sessions = pgTable("Session", {
    id: text("id").primaryKey(),
    sessionToken: text("sessionToken").notNull().unique(),
    userId: text("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("VerificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
}, (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

export const tasks = pgTable("Task", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    details: text("details").notNull().default(""),
    priority: text("priority").notNull().default("normal"),
    dueDate: timestamp("dueDate", { mode: "date" }).notNull(),
    isDone: boolean("isDone").notNull().default(false),
    rotation: text("rotation").notNull().default("none"),
    turnusDays: integer("turnusDays"),
    lastCompleted: timestamp("lastCompleted", { mode: "date" }),
    assigneeId: text("assigneeId").references(() => users.id),
});

export const expenses = pgTable("Expense", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    amount: doublePrecision("amount").notNull(),
    date: timestamp("date", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    split: text("split").notNull().default("equal"),
    category: text("category").notNull().default("other"),
    transactionType: text("transactionType").notNull().default("EXPENSE"),
    payerId: text("payerId").notNull().references(() => users.id),
    recipientId: text("recipientId").references(() => users.id),
});

export const activities = pgTable("Activity", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    meta: text("meta").notNull(),
    type: text("type").notNull().default("info"),
    timestamp: timestamp("timestamp", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const shoppingItems = pgTable("ShoppingItem", {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    isBought: boolean("isBought").notNull().default(false),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    addedById: text("addedById").notNull().references(() => users.id),
    assigneeId: text("assigneeId").references(() => users.id),
});

export const wgs = pgTable("WG", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    adminId: text("adminId").notNull().references(() => users.id),
    image: text("image"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const ledgers = pgTable("Ledger", {
    id: text("id").primaryKey(),
    wgId: text("wgId").notNull().unique().references(() => wgs.id, { onDelete: "cascade" }),
    balance: doublePrecision("balance").notNull().default(0),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const inviteCodes = pgTable("InviteCode", {
    id: text("id").primaryKey(),
    code: text("code").notNull().unique(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().default(sql`CURRENT_TIMESTAMP`),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    usedBy: text("usedBy"),
    wgId: text("wgId").notNull().references(() => wgs.id),
});

// Relationships
export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    sessions: many(sessions),
    tasks: many(tasks),
    paidExpenses: many(expenses, { relationName: "payer" }),
    receivedExpenses: many(expenses, { relationName: "recipient" }),
    shoppingItems: many(shoppingItems, { relationName: "addedBy" }),
    assignedShoppingItems: many(shoppingItems, { relationName: "assignee" }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, {
        fields: [accounts.userId],
        references: [users.id],
    }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
    assignee: one(users, {
        fields: [tasks.assigneeId],
        references: [users.id],
    }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
    payer: one(users, {
        fields: [expenses.payerId],
        references: [users.id],
        relationName: "payer",
    }),
    recipient: one(users, {
        fields: [expenses.recipientId],
        references: [users.id],
        relationName: "recipient",
    }),
}));

export const shoppingItemsRelations = relations(shoppingItems, ({ one }) => ({
    addedBy: one(users, {
        fields: [shoppingItems.addedById],
        references: [users.id],
        relationName: "addedBy",
    }),
    assignee: one(users, {
        fields: [shoppingItems.assigneeId],
        references: [users.id],
        relationName: "assignee",
    }),
}));

export const inviteCodesRelations = relations(inviteCodes, ({ one }) => ({
    wg: one(wgs, {
        fields: [inviteCodes.wgId],
        references: [wgs.id],
    }),
}));

export const wgsRelations = relations(wgs, ({ many, one }) => ({
    inviteCodes: many(inviteCodes),
    ledger: one(ledgers, {
        fields: [wgs.id],
        references: [ledgers.wgId],
    }),
}));

export const ledgersRelations = relations(ledgers, ({ one }) => ({
    wg: one(wgs, {
        fields: [ledgers.wgId],
        references: [wgs.id],
    }),
}));
