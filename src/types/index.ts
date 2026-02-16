// Re-export all data types from the Prisma-backed actions layer.
// Components should continue to import from "@/types".

export type {
    TaskData as Task,
    ExpenseData as Expense,
    ActivityData as Activity,
    ShoppingItemData as ShoppingItem,
    UserData as User,
    WGInfo as WG,
    InviteCodeData as InviteCode,
    Debt,
    ActionResponse,
    DashboardData,
    WGData,
} from "@/app/actions";
