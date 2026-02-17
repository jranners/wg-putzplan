<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="TidyUp Dashboard" width="100%" />
</p>

# 🏠 TidyUp · WG-Manager

<p align="center">
  <strong>The definitive shared flat management OS.</strong><br/>
  Built with "Industrial Precision" design principles for maximum efficiency and clarity.
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript 5" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-ORM-1B222D?logo=prisma" alt="Prisma" /></a>
  <a href="https://opensource.org/licenses/ISC"><img src="https://img.shields.io/badge/License-ISC-green" alt="License" /></a>
</p>

---

## ⚡ Overview

**TidyUp** is a modern, full-featured application designed to streamline the complexities of shared living.  It replaces chaotic WhatsApp groups and excel sheets with a unified, "Industrial Precision" interface for managing cleaning schedules, shared finances, shopping lists, and house rules.

Key capabilities include:
- **Intelligent Task Scheduling**: Automatic rotation of cleaning duties based on customizable intervals.
- **Fair Finance Tracking**: Peer-to-peer debt calculation that simplifies "who owes who" into minimal transactions.
- **Real-time Synchronization**: Shared shopping lists and activity feeds that keep everyone in the loop.

---

## ✨ Features

### 📊 **Command Dashboard**
Your central hub for WG life. Get an at-a-glance overview of:
- **Upcoming Tasks**: What needs to be done today/this week.
- **Financial Status**: Your current balance (owed vs. owing).
- **Recent Activity**: A live feed of completed tasks and purchases.

### 💰 **Precision Finances**
Forgot who paid for pizza? TidyUp handles it.
- **Expense Splitting**: Split costs equally or by custom shares.
- **Smart Settlements**: The system calculates the simplest set of payments to settle all debts.
- **History**: Full audit trail of all transactions.

### 📋 **Task Automation**
Never argue about the cleaning plan again.
- **Rotation Logic**:  Tasks rotate automatically (Daily, Weekly, Bi-weekly, Monthly).
- **Gamification**: Track completion stats and see who is carrying the team.
- **Reminders**: Visual cues for overdue tasks in the "Industrial Red" alert state.

### 🛒 **Live Shopping List**
collaborative list that syncs instantly.
- **Add/Check-off**: Fast interaction for speedy supermarket runs.
- **Categorization**: Organize items for efficient shopping.

### 📈 **Analytics**
- **Contribution Charts**: Visualize who does the most chores.
- **Spending Trends**: Track household expenses over time.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
|-------|-----------|-------------|
| **Core** | [Next.js 14](https://nextjs.org/) | App Router, Server Actions, React Server Components |
| **Language** | TypeScript 5 | Strict type safety across the entire stack |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | "Industrial Precision" design system with pure black theme |
| **Database** | SQLite + [Prisma](https://www.prisma.io/) | Type-safe ORM with automated migrations |
| **UI/UX** | Radix UI + Framer Motion | Accessible primitives and fluid animations |
| **Testing** | Vitest | Unit and integration testing |

---

## 🧠 Development & Agentic Workflow

This project was built using an **Autonomous Agentic Workflow** known as **Loki Mode**. This involves a high-degree of AI collaboration where the AI operates as a senior engineer/architect.

- **`.loki/` Directory**: Contains the "brain" of the agentic session (working memory, context, task queues).
- **Design Features**: The application implements a specific "Industrial Precision" aesthetic defined by the AI to match the user's "Cyberpunk/Modern" preference.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jranners/wg-putzplan.git
   cd wg-putzplan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Initialize the Database**
   ```bash
   # Push schema to SQLite database (creates dev.db)
   npx prisma db push

   # Seed the database with initial demo data
   npx prisma db seed
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to verify the installation.

### Useful Scripts

| Command | Action |
|---------|--------|
| `npm run dev` | Starts local dev server with hot-reload |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production build |
| `npm run type-check` | Verifies TypeScript types |
| `npm run lint` | Runs ESLint |
| `npx prisma studio` | Opens a GUI to inspect the database |

---

## 📸 Gallery

<table>
  <tr>
    <td align="center"><strong>💸 Expenses & Debt</strong><br/>Track every cent with precision.</td>
    <td align="center"><strong>⚙️ Admin & Settings</strong><br/>Manage members and rules.</td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/expenses.png" alt="Expenses Interface" width="100%" /></td>
    <td><img src="docs/screenshots/settings.png" alt="Settings Interface" width="100%" /></td>
  </tr>
</table>

---

## 🎨 Design System

The app follows a strict **"Industrial Precision"** theme:

- **Surface**: Pure Black (`#000000`) & Deep Gray (`#1A1A1A`)
- **Accent**: Signal Cyan (`#13B6EC`) for primary actions
- **Feedback**:  Emerald (`#10B981`) for success, Crimson (`#EF4444`) for critical alerts
- **Typography**: `Inter` for UI, `JetBrains Mono` for data and numbers

See [DESIGN.md](./DESIGN.md) for the complete design specification.

---

## 📄 License

This project is licensed under the **ISC License**.
