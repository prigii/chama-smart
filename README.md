# ChamaSmart

A Progressive Web App (PWA) SaaS for managing Kenyan Investment Groups (Chamas), handling member management, savings, table banking (loans), and investment tracking.

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui (Radix UI) + Lucide React icons
- **Database:** Neon Postgres (Serverless)
- **Auth:** Neon Auth (or Clerk)
- **ORM:** Prisma
- **File Storage:** UploadThing
- **Deployment:** Vercel
- **PWA:** `next-pwa` or `@ducanh2912/next-pwa`

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon Postgres database (sign up at [neon.tech](https://neon.tech))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chama-smart
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your Neon Postgres connection string

4. Run database migrations:
```bash
npx prisma migrate dev --name init
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Schema

The application uses Prisma ORM with the following models:

- **User** - Member management with roles (Admin, Treasurer, Member)
- **Transaction** - Financial transactions (Deposits, Withdrawals, Loan payments, etc.)
- **Loan** - Table banking loans with interest calculation
- **LoanGuarantor** - Guarantor approval system
- **Asset** - Investment portfolio tracking

See `prisma/schema.prisma` for the complete schema definition.

## Project Structure

```
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
  /shared       # Reusable custom components
/lib
  prisma.ts     # DB client
  utils.ts      # Helper functions
  actions.ts    # Server actions
```

## Core Features (MVP)

1. **Dashboard** - High-level summary of Group Assets, Cash at Hand, Active Loans, and Member Savings
2. **Member Management** - Add/Remove members, assign roles
3. **Transactions (The Ledger)** - Record Deposits, Withdrawals, and Expenses
4. **Table Banking (Loans)** - Loan requests, guarantor approval, interest calculation
5. **Investment Portfolio** - Track Assets and their current valuation

## Development

- Run development server: `npm run dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Lint code: `npm run lint`
- Generate Prisma client: `npx prisma generate`
- Create migration: `npx prisma migrate dev --name <migration-name>`

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com)

## License

MIT
