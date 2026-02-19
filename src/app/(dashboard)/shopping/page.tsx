import { Sidebar } from "@/components/layout/Sidebar";
import { ShoppingList } from "@/components/shopping/ShoppingComponents";
import { getShoppingItems, getUsers } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";

export default async function ShoppingPage() {
    const items = await getShoppingItems();
    const users = await getUsers();
    const user = await getCurrentUser();

    // Fallback if no user
    const currentUserId = user?.id || "";

    return (
        <div className="flex h-screen overflow-hidden bg-black text-white">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="mx-auto max-w-3xl space-y-8">

                    <header>
                        <h1 className="text-3xl font-bold text-white mb-2">Einkaufsliste</h1>
                        <p className="text-slate-400">Vergesst nie wieder Spüli oder Müllbeutel.</p>
                    </header>

                    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 md:p-8 min-h-[600px] relative">
                        <ShoppingList items={items} users={users} currentUserId={currentUserId} />
                    </div>
                </div>
            </main>
        </div>
    );
}
