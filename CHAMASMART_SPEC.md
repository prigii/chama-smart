# Project Name: ChamaSmart
**Description:** A Progressive Web App (PWA) SaaS for managing Kenyan Investment Groups (Chamas), handling member management, savings, table banking (loans), and investment tracking.

## 1. Tech Stack & Environment
* **Framework:** Next.js 15+ (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **UI Components:** Shadcn/ui (Radix UI) + Lucide React icons
* **Database:** Neon Postgres (Serverless)
* **Auth:** Neon Auth (or Clerk if Neon Auth is not fully ready for production, but prioritize Neon ecosystem)
* **ORM:** Prisma
* **File Storage:** UploadThing
* **Deployment Target:** Vercel
* **PWA:** `next-pwa` or `@ducanh2912/next-pwa`

## 2. Core Features (MVP)
1.  **Dashboard:** High-level summary of Group Assets, Cash at Hand, Active Loans, and Member Savings.
2.  **Member Management:** Add/Remove members, assign roles (Admin/Treasurer vs. Member).
3.  **Transactions (The Ledger):** Record Deposits (Savings), Withdrawals, and Expenses.
4.  **Table Banking (Loans):** * Loan Request workflow.
    * Guarantor approval system.
    * Interest calculation (Simple/Reducing balance).
5.  **Investment Portfolio:** Track Assets (Land, Stocks, Money Market Funds) and their current valuation.

## 3. Database Schema (Prisma)
Use this schema as the source of truth for the database structure.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  MEMBER
  TREASURER
}

enum TransactionType {
  DEPOSIT
  WITHDRAWAL
  LOAN_DISBURSEMENT
  LOAN_REPAYMENT
  EXPENSE
  FINE
}

enum LoanStatus {
  PENDING
  APPROVED
  REJECTED
  ACTIVE
  PAID
  DEFAULTED
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  phone         String?   // Important for M-Pesa integration
  avatarUrl     String?
  role          UserRole  @default(MEMBER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  transactions  Transaction[]
  loans         Loan[]          @relation("Borrower")
  guarantees    LoanGuarantor[]
}

model Transaction {
  id              String          @id @default(cuid())
  amount          Decimal         @db.Decimal(10, 2)
  type            TransactionType
  description     String?
  referenceCode   String?         // M-Pesa Code
  date            DateTime        @default(now())
  
  // Relations
  userId          String
  user            User            @relation(fields: [userId], references: [id])
}

model Loan {
  id              String      @id @default(cuid())
  amount          Decimal     @db.Decimal(10, 2)
  interestRate    Decimal     // e.g., 10 for 10%
  durationMonths  Int
  totalRepayable  Decimal     @db.Decimal(10, 2)
  balance         Decimal     @db.Decimal(10, 2)
  status          LoanStatus  @default(PENDING)
  dueDate         DateTime?
  createdAt       DateTime    @default(now())

  // Relations
  borrowerId      String
  borrower        User            @relation("Borrower", fields: [borrowerId], references: [id])
  guarantors      LoanGuarantor[]
}

model LoanGuarantor {
  id        String   @id @default(cuid())
  amount    Decimal  @db.Decimal(10, 2) // Amount guaranteed
  accepted  Boolean  @default(false)
  
  // Relations
  loanId    String
  loan      Loan     @relation(fields: [loanId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  @@unique([loanId, userId])
}

model Asset {
  id            String   @id @default(cuid())
  name          String
  description   String?
  purchaseDate  DateTime
  purchasePrice Decimal  @db.Decimal(12, 2)
  currentValue  Decimal  @db.Decimal(12, 2)
  category      String   // e.g., Land, Equity, Bonds
  documents     String[] // URLs from UploadThing
}

Design Guidelines (UI/UX)
Theme: Professional, Clean, Trustworthy.

Colors: Primary color should be a deep "Finance Blue" or "Growth Green".

Layout: * Sidebar: For navigation (Dashboard, Wallet, Loans, Members, Settings).

Top Bar: User profile and Notifications.

Cards: Use Shadcn Cards for summarizing data statistics.

Tables: Use Shadcn Data Table for robust transaction lists with filtering.

Mobile-First: Ensure all tables scroll horizontally on mobile and buttons are touch-friendly.

5. Implementation Rules for AI
Scaffolding: Start by initializing a standard Next.js App Router project.

Components: When asked to create UI, always check if a Shadcn component exists for it (e.g., Button, Input, Dialog, Card) and install it via CLI (npx shadcn@latest add ...).

Server Actions: Use Server Actions for all data mutations (Creating loans, adding transactions). Do not use API routes unless necessary for external webhooks (like M-Pesa).

Type Safety: Strictly adhere to the Prisma generated types. Do not use any.

PWA: Ensure the manifest.json and icons are configured correctly in app/layout.tsx.

6. Directory Structure Preference
/app
  /(auth)       # Login/Register routes
  /(dashboard)  # Protected routes
    /overview   # Main stats
    /loans      # Loan management
    /wallet     # Transactions & Savings
    /members    # User management
  /api          # Webhooks (M-Pesa/UploadThing)
/components
  /ui           # Shadcn components
  /shared       # Reusable custom components (e.g., Sidebar, MetricCard)
/lib
  prisma.ts     # DB client
  utils.ts      # Helper functions
  actions.ts    # Server actions