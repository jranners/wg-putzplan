import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { getExpenses, getDebts, getUsers } from "@/app/actions";
import { cn } from "@/lib/utils";
import { DebtList } from "@/components/expenses/DebtList";

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    // Assuming current user ID is "1". In a real app, get from session/auth.
    const currentUserId = "1";
    const debts = await getDebts(currentUserId);
    const users = await getUsers();

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto bg-[#000000] p-4 py-6 md:p-10 pb-32 lg:pb-10">
                <div className="mx-auto max-w-4xl space-y-8">

                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Finanzübersicht</h1>
                            <p className="text-white/40">Verwalte gemeinsame Ausgaben und Schulden.</p>
                        </div>
                    </header>

                    {/* Peer-to-Peer Debt List */}
                    <DebtList debts={debts} allUsers={users} />

                    <AddExpenseForm />

                    <ExpenseList expenses={expenses} />

                </div>
            </main>
            <MobileNav />
        </div>
    );
}
