import { describe, it, expect } from 'vitest';
import type { Expense, User } from '@/types';

/**
 * Pure function extracted from actions.ts getDebts() logic.
 * This mirrors the exact algorithm used in production.
 */
function calculateDebts(
    expenses: Expense[],
    users: User[],
    currentUserId: string
): { userId: string; userName: string; amount: number }[] {
    const balances: Record<string, number> = {};
    users.forEach(u => u.id !== currentUserId && (balances[u.id] = 0));

    expenses.forEach(expense => {
        const type = expense.transactionType || "EXPENSE";

        if (type === "SETTLEMENT") {
            if (expense.payerId === currentUserId && expense.recipientId) {
                // I pay Bob -> Bob owes me more (or I owe him less)
                balances[expense.recipientId] = (balances[expense.recipientId] || 0) + expense.amount;
            } else if (expense.recipientId === currentUserId) {
                // Bob pays me -> Bob owes me less (or I owe him more)
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
        .map(u => ({
            userId: u.id,
            userName: u.name,
            amount: balances[u.id] || 0
        }))
        .filter(d => Math.abs(d.amount) > 0.01);
}

const USERS: User[] = [
    { id: "1", name: "Julius", role: "admin", avatarUrl: null },
    { id: "2", name: "Lukas", role: "member", avatarUrl: null },
];

describe('Debt Calculation Engine', () => {
    it('calculates shared expense correctly (split equally)', () => {
        const expenses: Expense[] = [{
            id: "e1", title: "Pizza", amount: 100, payerId: "1",
            date: "2026-01-01", split: "equal", category: "groceries",
            transactionType: "EXPENSE", recipientId: null
        }];

        const debts = calculateDebts(expenses, USERS, "1");
        // Julius paid 100, split 2 ways → Lukas owes Julius 50
        expect(debts[0].amount).toBe(50);
    });

    it('SETTLEMENT reduces debt correctly', () => {
        const USERS_2: User[] = [
            { id: "A", name: "Alice", role: "member", avatarUrl: null },
            { id: "B", name: "Bob", role: "member", avatarUrl: null },
        ];
        /**
         * 1. Bob buys Pizza for 100€ (Alice owes Bob 50€)
         * 2. Alice pays Bob 50€ (Debt settled)
         */
        const expenses: Expense[] = [
            {
                id: "e1", title: "Pizza", amount: 100, payerId: "B",
                date: "2026-01-01", split: "equal", category: "groceries",
                transactionType: "EXPENSE", recipientId: null
            },
            {
                id: "s1", title: "Settlement", amount: 50, payerId: "A",
                recipientId: "B", transactionType: "SETTLEMENT",
                date: "2026-01-02", split: "equal", category: "other"
            },
        ];

        const debtsA = calculateDebts(expenses, USERS_2, "A");
        expect(debtsA.length).toBe(0); // Debt settled

        const debtsB = calculateDebts(expenses, USERS_2, "B");
        expect(debtsB.length).toBe(0); // Debt settled
    });

    it('handles negative balances (receiving money)', () => {
        const USERS_2: User[] = [
            { id: "A", name: "Alice", role: "member", avatarUrl: null },
            { id: "B", name: "Bob", role: "member", avatarUrl: null },
        ];
        // Bob pays Alice 100€ (Alice now owes Bob 100€)
        const expenses: Expense[] = [
            {
                id: "s1", title: "Cash", amount: 100, payerId: "B",
                recipientId: "A", transactionType: "SETTLEMENT",
                date: "2026-01-02", split: "equal", category: "other"
            },
        ];

        const debtsA = calculateDebts(expenses, USERS_2, "A");
        expect(debtsA[0].amount).toBe(-100); // Alice owes 100
    });
});

describe('Complex Group Scenarios (6+ Persons)', () => {
    const USERS_6: User[] = [
        { id: "A", name: "Alice", role: "member", avatarUrl: null },
        { id: "B", name: "Bob", role: "member", avatarUrl: null },
        { id: "C", name: "Charlie", role: "member", avatarUrl: null },
        { id: "D", name: "David", role: "member", avatarUrl: null },
        { id: "F", name: "Frank", role: "member", avatarUrl: null },
        { id: "G", name: "Georg", role: "member", avatarUrl: null },
    ];

    it('handles the "Full Circle" scenario with 6 people correctly', () => {
        /**
         * Scenario:
         * A owes B 100€
         * B owes C,D,F,G 25€ each
         * C,D,F,G owe A 25€ each
         */
        const expenses: Expense[] = [
            // A owes B 100€ (Bob gave Alice 100€)
            { id: "1", title: "Loan", amount: 100, payerId: "B", recipientId: "A", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },

            // B owes C 25€ (Charlie gave Bob 25€)
            { id: "2", title: "Loan", amount: 25, payerId: "C", recipientId: "B", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "3", title: "Loan", amount: 25, payerId: "D", recipientId: "B", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "4", title: "Loan", amount: 25, payerId: "F", recipientId: "B", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "5", title: "Loan", amount: 25, payerId: "G", recipientId: "B", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },

            // Charlie owes A 25€ (Alice gave Charlie 25€)
            { id: "6", title: "Loan", amount: 25, payerId: "A", recipientId: "C", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "7", title: "Loan", amount: 25, payerId: "A", recipientId: "D", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "8", title: "Loan", amount: 25, payerId: "A", recipientId: "F", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
            { id: "9", title: "Loan", amount: 25, payerId: "A", recipientId: "G", transactionType: "SETTLEMENT", date: "2026-01-01", split: "equal", category: "other" },
        ];

        // Perspective of ALICE (A)
        const debtsA = calculateDebts(expenses, USERS_6, "A");

        // Alice owes Bob 100 => balance -100
        expect(debtsA.find(d => d.userId === "B")?.amount).toBe(-100);

        // Charlie owes Alice 25 => balance +25
        expect(debtsA.find(d => d.userId === "C")?.amount).toBe(25);

        // Net balance for Alice: -100 (B) + 25*4 (C,D,F,G) = 0
        const totalNetA = debtsA.reduce((sum, d) => sum + d.amount, 0);
        expect(totalNetA).toBe(0);

        // Perspective of BOB (B)
        const debtsB = calculateDebts(expenses, USERS_6, "B");

        // Alice owes Bob 100 => balance +100
        expect(debtsB.find(d => d.userId === "A")?.amount).toBe(100);

        // Bob owes Charlie 25 => balance -25
        expect(debtsB.find(d => d.userId === "C")?.amount).toBe(-25);

        // Net balance for Bob: 100 (A) - 25*4 (C,D,F,G) = 0
        const totalNetB = debtsB.reduce((sum, d) => sum + d.amount, 0);
        expect(totalNetB).toBe(0);
    });

    it('handles a shared expense with 6 people correctly', () => {
        const sharedExpense: Expense = {
            id: "e1", title: "WG Dinner", amount: 60, payerId: "A",
            date: "2026-01-01", split: "equal", category: "groceries",
            transactionType: "EXPENSE", recipientId: null
        };

        const debtsA = calculateDebts([sharedExpense], USERS_6, "A");
        expect(debtsA.length).toBe(5);
        debtsA.forEach(d => expect(d.amount).toBe(10));

        const debtsB = calculateDebts([sharedExpense], USERS_6, "B");
        expect(debtsB.length).toBe(1);
        expect(debtsB[0].userId).toBe("A");
        expect(debtsB[0].amount).toBe(-10);
    });
});
