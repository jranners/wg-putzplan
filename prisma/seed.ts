import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Clean all tables
    await prisma.inviteCode.deleteMany();
    await prisma.shoppingItem.deleteMany();
    await prisma.expense.deleteMany();
    await prisma.task.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.wG.deleteMany();
    await prisma.user.deleteMany();

    // ── Users ──
    const schmidt = await prisma.user.create({
        data: {
            id: "1",
            name: "M. Schmidt",
            role: "admin",
            avatarUrl:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDgTQ1xETtHEGqxo4fXcn1MBRszEnatAszgJwCfXL8ZKKt_yWguJJYLDPLoAnwp3h8_rNRNzoxX_Fs7Se1WXnIAy95Yx1MIudC2gRQgzLOJFWJVowpNA_qzXtrx-XN3rMuuatCLf1lbfVFNoTMTpqMmsXIWoeZxUiSAF80HXeOaL5OCXe-AgSX7SczC7YBPL8Mjqy5TiJ-h57RWp24cjMfmNDszvYraYL0TB5w-dCCAQDIQLUKhGyU72qwj7x5vGYjGVATFvBftlBPJ",
        },
    });

    const lukas = await prisma.user.create({
        data: {
            id: "2",
            name: "Lukas Weber",
            role: "member",
        },
    });

    console.log(`✅ Created users: ${schmidt.name}, ${lukas.name}`);

    // ── Tasks ──
    await prisma.task.createMany({
        data: [
            {
                title: "Brandschutz-Inspektion",
                details: "Haus B, Alle Etagen prüfen",
                priority: "normal",
                dueDate: new Date("2026-02-15T00:00:00.000Z"),
                isDone: true,
                assigneeId: schmidt.id,
            },
            {
                title: "Mietvertrag Erneuerung",
                details: "Apt. 212 - Familie Müller",
                priority: "normal",
                dueDate: new Date("2026-02-16T10:00:00.000Z"),
                isDone: true,
                assigneeId: lukas.id,
            },
            {
                title: "Treppenhausreinigung",
                details: "Quartalsabrechnung Service",
                priority: "high",
                dueDate: new Date("2026-02-18T14:00:00.000Z"),
                isDone: false,
                assigneeId: schmidt.id,
            },
            {
                title: "Test Rotation Task",
                details: "",
                priority: "high",
                rotation: "weekly",
                dueDate: new Date("2026-08-16T23:00:00.000Z"),
                isDone: false,
                assigneeId: lukas.id,
            },
            {
                title: "Küche Putzen",
                details: "",
                priority: "normal",
                rotation: "weekly",
                dueDate: new Date("2026-02-23T00:00:00.000Z"),
                isDone: false,
                assigneeId: schmidt.id,
            },
        ],
    });
    console.log("✅ Created 5 tasks");

    // ── Expenses ──
    await prisma.expense.create({
        data: {
            title: "Einkauf Supermarkt",
            amount: 100,
            category: "groceries",
            date: new Date("2026-02-16T00:00:00.000Z"),
            payerId: schmidt.id,
            split: "equal",
        },
    });

    await prisma.expense.create({
        data: {
            title: "Ausgleich: Lukas Weber",
            amount: 23,
            payerId: schmidt.id,
            recipientId: lukas.id,
            transactionType: "SETTLEMENT",
            date: new Date("2026-02-16T14:18:49.637Z"),
            category: "other",
            split: "equal",
        },
    });
    console.log("✅ Created 2 expenses");

    // ── Activities ──
    await prisma.activity.createMany({
        data: [
            {
                title: "Wartung Aufzug abgeschlossen",
                meta: "Vor 2 Std • Haus A",
                type: "maintenance",
                timestamp: new Date("2026-02-15T16:00:00.000Z"),
            },
            {
                title: "Neue Mieter eingezogen",
                meta: "Apt. 305 • Haus C",
                type: "info",
                timestamp: new Date("2026-02-15T14:00:00.000Z"),
            },
            {
                title: "Schulden beglichen",
                meta: "An Lukas Weber ausgeglichen",
                type: "finance",
                timestamp: new Date("2026-02-16T14:18:49.637Z"),
            },
            {
                title: "Aufgabe erstellt: Küche Putzen",
                meta: "Neu hinzugefügt",
                type: "info",
                timestamp: new Date("2026-02-16T14:43:02.959Z"),
            },
        ],
    });
    console.log("✅ Created 4 activities");

    // ── Shopping Items ──
    await prisma.shoppingItem.createMany({
        data: [
            {
                title: "Spülmaschinentabs",
                isBought: false,
                addedById: schmidt.id,
                createdAt: new Date("2026-02-15T10:00:00.000Z"),
            },
            {
                title: "Müllbeutel (35L)",
                isBought: true,
                addedById: lukas.id,
                createdAt: new Date("2026-02-14T15:00:00.000Z"),
            },
        ],
    });
    console.log("✅ Created 2 shopping items");

    // ── WG ──
    const wg = await prisma.wG.create({
        data: {
            id: "wg_flatcontroll",
            name: "WG Flatcontroll",
            adminId: schmidt.id,
        },
    });
    console.log(`✅ Created WG: ${wg.name}`);

    // ── Invite Codes ──
    await prisma.inviteCode.create({
        data: {
            code: "wg_flatcontroll-267091",
            wgId: wg.id,
            createdAt: new Date("2026-02-16T14:33:31.050Z"),
            expiresAt: new Date("2026-02-23T14:33:31.050Z"),
        },
    });
    console.log("✅ Created 1 invite code");

    console.log("\n🎉 Seed completed successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
