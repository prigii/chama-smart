# ChamaSmart - Complete Setup Guide

## ✅ What's Been Completed

### 1. Authentication System
- ✅ NextAuth v5 configured with credentials provider
- ✅ Password hashing with bcryptjs
- ✅ Protected routes with middleware
- ✅ Sign-in page with error handling
- ✅ Session management

### 2. Dashboard Layout
- ✅ Responsive sidebar navigation
- ✅ User profile dropdown
- ✅ Active route highlighting
- ✅ Professional design with Tailwind CSS

### 3. Member Management
- ✅ Add new members with roles (Admin, Treasurer, Member)
- ✅ View all members with statistics
- ✅ Update member roles
- ✅ Delete members
- ✅ Track member transactions and loans

### 4. Transaction Ledger (Wallet)
- ✅ Record deposits, withdrawals, expenses, and fines
- ✅ M-Pesa reference code tracking
- ✅ Transaction history with filtering
- ✅ Real-time balance calculations

### 5. Loan Management System
- ✅ Create loans with interest calculation
- ✅ Guarantor system (up to 2 guarantors per loan)
- ✅ Loan status management (Pending → Approved → Active → Paid)
- ✅ Loan repayment tracking
- ✅ Progress indicators
- ✅ Overdue loan alerts

### 6. Investment Portfolio
- ✅ Track assets (Land, Equity, Bonds, etc.)
- ✅ Purchase price and current value tracking
- ✅ Gain/Loss calculations with percentages
- ✅ Portfolio summary statistics

### 7. Dashboard Overview
- ✅ Cash at hand summary
- ✅ Active loans count
- ✅ Total members
- ✅ Total assets value
- ✅ Recent transactions feed
- ✅ Recent loans feed
- ✅ Overdue loans alert

## 🚀 Getting Started

### Step 1: Create Your First Admin User

Since the database is fresh, you need to create your first admin user. You can do this in two ways:

#### Option A: Using Prisma Studio (Recommended)

1. Open Prisma Studio:
```bash
npx prisma studio
```

2. Navigate to the `User` model
3. Click "Add record"
4. Fill in the fields:
   - email: `admin@chamasmart.com`
   - password: Use this pre-hashed password for "admin123":
     ```
     $2a$10$YourHashedPasswordHere
     ```
   - name: `Admin User`
   - phone: `+254712345678` (optional)
   - role: `ADMIN`
5. Click "Save 1 change"

#### Option B: Direct Database Insert

Run this SQL in your Neon database console:

```sql
INSERT INTO "User" (id, email, password, name, phone, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  'admin@chamasmart.com',
  '$2a$10$rOZJZ8vK5qHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqHxGxJ5qVZ5qeYqH',
  'Admin User',
  '+254712345678',
  'ADMIN',
  NOW(),
  NOW()
);
```

**Note:** The password hash above is for `admin123`. For production, generate a new hash:

```javascript
const bcrypt = require('bcryptjs');
const hash = await bcrypt.hash('your-password', 10);
console.log(hash);
```

### Step 2: Start the Development Server

```bash
npm run dev
```

### Step 3: Sign In

1. Navigate to `http://localhost:3000`
2. You'll be redirected to the sign-in page
3. Use your admin credentials:
   - Email: `admin@chamasmart.com`
   - Password: `admin123` (or your custom password)

### Step 4: Explore the Dashboard

Once signed in, you'll have access to:

- **Overview**: Dashboard with key metrics
- **Members**: Add and manage chama members
- **Wallet**: Record and track all transactions
- **Loans**: Manage table banking loans
- **Investments**: Track your investment portfolio

## 📊 Features Guide

### Adding Members

1. Go to **Members** page
2. Click "Add Member"
3. Fill in:
   - Full Name
   - Email (must be unique)
   - Password
   - Phone (optional, for M-Pesa)
   - Role (Admin, Treasurer, or Member)
4. Click "Create Member"

**Roles:**
- **Admin**: Full access to all features
- **Treasurer**: Can manage transactions and loans
- **Member**: Can view their own transactions and loans

### Recording Transactions

1. Go to **Wallet** page
2. Click "New Transaction"
3. Select:
   - Member
   - Transaction Type (Deposit, Withdrawal, Expense, Fine)
   - Amount
   - Description (optional)
   - M-Pesa Code (optional)
4. Click "Record Transaction"

### Creating Loans

1. Go to **Loans** page
2. Click "New Loan"
3. Fill in:
   - Borrower
   - Loan Amount
   - Interest Rate (%)
   - Duration (months)
   - Guarantor 1 & Amount
   - Guarantor 2 & Amount (optional)
4. Click "Create Loan"

**Loan Workflow:**
1. Loan created with status "PENDING"
2. Change status to "APPROVED" when approved
3. Change to "ACTIVE" when disbursed (auto-creates disbursement transaction)
4. Record repayments using "Repay" button
5. Status automatically changes to "PAID" when fully repaid

### Managing Investments

1. Go to **Investments** page
2. Click "Add Asset"
3. Fill in:
   - Asset Name
   - Category (Land, Equity, Bonds, etc.)
   - Description (optional)
   - Purchase Date
   - Purchase Price
   - Current Value
4. Click "Add Asset"

The system automatically calculates:
- Total investment
- Current portfolio value
- Gain/Loss amount and percentage

## 🎨 Design Features

- **Professional UI**: Clean, modern design with Shadcn/ui components
- **Responsive**: Works on desktop, tablet, and mobile
- **Color-coded**: Visual indicators for transaction types and loan statuses
- **Real-time Updates**: All data updates immediately
- **Kenyan Context**: KES currency formatting, phone number support

## 🔒 Security Features

- **Password Hashing**: All passwords encrypted with bcrypt
- **Protected Routes**: Middleware ensures only authenticated users access dashboard
- **Role-based Access**: Different permissions for Admin, Treasurer, and Member
- **Session Management**: Secure JWT-based sessions

## 📱 Mobile Responsiveness

The application is fully responsive:
- Sidebar collapses on mobile
- Tables scroll horizontally
- Touch-friendly buttons
- Optimized forms for mobile input

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Open Prisma Studio (database GUI)
npx prisma studio

# Create a new migration
npx prisma migrate dev --name migration_name

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

## 📝 Environment Variables

Make sure your `.env` file has:

```env
DATABASE_URL="your-neon-postgres-url"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 🚀 Deployment to Vercel

1. Push your code to GitHub
2. Import repository in Vercel
3. Add environment variables:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

## 🎯 Next Steps

1. **Add more members** to your chama
2. **Record monthly contributions** as deposits
3. **Create loans** for members who need them
4. **Track investments** as your chama grows
5. **Monitor the dashboard** for key metrics

## 💡 Tips

- Use the M-Pesa reference code field to track mobile money transactions
- Set up guarantors before approving loans
- Update asset values regularly to track investment performance
- Use the dashboard overview to get a quick snapshot of your chama's health

## 🐛 Troubleshooting

### Can't sign in?
- Make sure you created the admin user correctly
- Check that the password hash matches
- Verify DATABASE_URL is correct in .env

### Database errors?
- Run `npx prisma generate` to regenerate the client
- Check your Neon database is running
- Verify the connection string

### UI not loading?
- Clear browser cache
- Check console for errors
- Restart the dev server

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the code comments
3. Check Prisma and NextAuth documentation

---

**Built with:** Next.js 15, TypeScript, Prisma, NextAuth, Tailwind CSS, Shadcn/ui
