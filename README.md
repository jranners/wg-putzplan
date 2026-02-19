# 🏠 TidyUp · The Intelligent WG-Manager

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-ISC-green)](https://opensource.org/licenses/ISC)

**TidyUp** is a premium shared-flat (WG) management platform built with "Industrial Precision" design principles. It streamlines household logistics, ensuring fair task distribution, transparent financial tracking, and seamless group coordination.

---

## ✨ Core Features

### 📊 Precision Dashboard
A centralized command center for your household.
- **Task Lifecycle**: Real-time tracking of upcoming and overdue cleaning duties.
- **Financial Status**: Instant overview of net balances across the flat.
- **Activity Insight**: A unified feed of all household updates and expenses.

### 💰 Automated Finances
Eliminate the complexity of shared expenses.
- **Smart Settlements**: Advanced algorithms calculate the minimal number of transactions required to settle all debts.
- **PayPal Integration**: Integrated "Log in with PayPal" for frictionless peer-to-peer transfers.
- **Audit-Ready History**: Transparent logging of every purchase and settlement.

### 📋 Intelligent Scheduling
Fairness through automation.
- **Dynamic Rotations**: Flexible scheduling (Daily, Weekly, Monthly) with automated user rotation.
- **Performance Analytics**: Gamified contribution tracking to visualize household effort over time.
- **Overdue Alerts**: Visual priority systems to ensure no task is forgotten.

### 🛒 Synchronized Shopping
Real-time collaborative lists.
- **Instant Updates**: Shared lists that sync instantly across all flatmate devices.
- **Categories**: Optimized for efficient supermarket navigation.

---

## 🏗️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15 (App Router)](https://nextjs.org/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **Logic** | [React 19 Server Components/Actions](https://react.dev/) |
| **Database** | Postgres with [Drizzle ORM](https://orm.drizzle.team/) |
| **Auth** | [NextAuth.js](https://next-auth.js.org/) |
| **Styling** | Vanilla CSS (Modular & Performance-tuned) |
| **Animation** | [Framer Motion](https://www.framer.com/motion/) |
| **Testing** | [Vitest](https://vitest.dev/) |

---

## 📂 Architecture Overview

```text
├── src/
│   ├── app/          # Next.js App Router (Pages, API, Actions)
│   ├── components/   # UI Components (Atomic Design approach)
│   ├── lib/          # Core Logic (Database, Auth, Debt Engine)
│   ├── types/        # TypeScript Interfaces
│   └── actions/      # Server Actions
├── public/           # Static Assets
├── docs/             # Documentation & Screenshots
└── drizzle.config.ts # Database Configuration
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js (Latest LTS)
- PostgreSQL Instance

### Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/wg_putzplan"
   NEXTAUTH_URL="http://localhost:3000"
   AUTH_SECRET="your-32-char-random-string"
   
   # PayPal Integration (Optional)
   PAYPAL_CLIENT_ID="your-id"
   PAYPAL_CLIENT_SECRET="your-secret"
   ```

3. **Database Migration**
   ```bash
   npx drizzle-kit push
   ```

4. **Launch Application**
   ```bash
   npm run dev
   ```

---

## 💳 Payment Flow
TidyUp uses integrated PayPal links. When an expense is recorded:
1. The system calculates peer-to-peer debts.
2. Debtors are presented with a "Pay with PayPal" option.
3. Users are redirected to the creditor's `paypal.me` link with the pre-filled amount.

---

## 📄 License
This project is licensed under the ISC License.
