import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting multitenancy seed...\n");

  // ============================================
  // CHAMA 1: Sunrise Investment Group
  // ============================================
  console.log("📦 Creating Chama 1: Sunrise Investment Group");
  
  const chama1 = await prisma.chama.create({
    data: {
      name: "Sunrise Investment Group",
      email: "info@sunrise.com",
      phone: "+254700111222",
    },
  });

  // Chama 1 Users
  const chama1Admin = await prisma.user.create({
    data: {
      chamaId: chama1.id,
      email: "admin@sunrise.com",
      password: await bcrypt.hash("password123", 10),
      name: "James Mwangi",
      phone: "+254701111111",
      role: "ADMIN",
    },
  });

  const chama1Treasurer = await prisma.user.create({
    data: {
      chamaId: chama1.id,
      email: "treasurer@sunrise.com",
      password: await bcrypt.hash("password123", 10),
      name: "Grace Akinyi",
      phone: "+254702222222",
      role: "TREASURER",
    },
  });

  const chama1Member1 = await prisma.user.create({
    data: {
      chamaId: chama1.id,
      email: "john@sunrise.com",
      password: await bcrypt.hash("password123", 10),
      name: "John Kamau",
      phone: "+254703333333",
      role: "MEMBER",
    },
  });

  const chama1Member2 = await prisma.user.create({
    data: {
      chamaId: chama1.id,
      email: "mary@sunrise.com",
      password: await bcrypt.hash("password123", 10),
      name: "Mary Wanjiku",
      phone: "+254704444444",
      role: "MEMBER",
    },
  });

  console.log(`✅ Created 4 users for ${chama1.name}`);

  // Chama 1 Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: chama1Admin.id,
        amount: 10000,
        type: "DEPOSIT",
        description: "January contribution",
        referenceCode: "QAB1CD2EFG",
      },
      {
        userId: chama1Treasurer.id,
        amount: 10000,
        type: "DEPOSIT",
        description: "January contribution",
        referenceCode: "QAB2CD3EFG",
      },
      {
        userId: chama1Member1.id,
        amount: 10000,
        type: "DEPOSIT",
        description: "January contribution",
        referenceCode: "QAB3CD4EFG",
      },
      {
        userId: chama1Member2.id,
        amount: 10000,
        type: "DEPOSIT",
        description: "January contribution",
        referenceCode: "QAB4CD5EFG",
      },
    ],
  });

  console.log(`✅ Created 4 transactions for ${chama1.name}`);

  // Chama 1 Loan
  const chama1Loan = await prisma.loan.create({
    data: {
      borrowerId: chama1Member1.id,
      amount: 50000,
      interestRate: 10,
      durationMonths: 6,
      totalRepayable: 55000,
      balance: 55000,
      status: "APPROVED",
    },
  });

  // Chama 1 Loan Guarantors
  await prisma.loanGuarantor.createMany({
    data: [
      {
        loanId: chama1Loan.id,
        userId: chama1Admin.id,
        amount: 25000,
        accepted: true,
      },
      {
        loanId: chama1Loan.id,
        userId: chama1Treasurer.id,
        amount: 25000,
        accepted: true,
      },
    ],
  });

  console.log(`✅ Created 1 loan with 2 guarantors for ${chama1.name}`);

  // Chama 1 Asset
  await prisma.asset.create({
    data: {
      chamaId: chama1.id,
      name: "Land in Kiambu",
      description: "1/4 acre plot near Thika Road",
      purchaseDate: new Date("2024-06-15"),
      purchasePrice: 800000,
      currentValue: 950000,
      category: "Land",
      documents: [],
    },
  });

  console.log(`✅ Created 1 asset for ${chama1.name}\n`);

  // ============================================
  // CHAMA 2: Unity Savings Group
  // ============================================
  console.log("📦 Creating Chama 2: Unity Savings Group");

  const chama2 = await prisma.chama.create({
    data: {
      name: "Unity Savings Group",
      email: "info@unity.com",
      phone: "+254700333444",
    },
  });

  // Chama 2 Users
  const chama2Admin = await prisma.user.create({
    data: {
      chamaId: chama2.id,
      email: "admin@unity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Peter Omondi",
      phone: "+254705555555",
      role: "ADMIN",
    },
  });

  const chama2Member1 = await prisma.user.create({
    data: {
      chamaId: chama2.id,
      email: "alice@unity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Alice Njeri",
      phone: "+254706666666",
      role: "MEMBER",
    },
  });

  const chama2Member2 = await prisma.user.create({
    data: {
      chamaId: chama2.id,
      email: "bob@unity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Bob Mutua",
      phone: "+254707777777",
      role: "MEMBER",
    },
  });

  console.log(`✅ Created 3 users for ${chama2.name}`);

  // Chama 2 Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: chama2Admin.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Weekly contribution",
        referenceCode: "QCD1EF2GHI",
      },
      {
        userId: chama2Member1.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Weekly contribution",
        referenceCode: "QCD2EF3GHI",
      },
      {
        userId: chama2Member2.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Weekly contribution",
        referenceCode: "QCD3EF4GHI",
      },
    ],
  });

  console.log(`✅ Created 3 transactions for ${chama2.name}`);

  // Chama 2 Asset
  await prisma.asset.create({
    data: {
      chamaId: chama2.id,
      name: "Treasury Bonds",
      description: "Government bonds - 5 year maturity",
      purchaseDate: new Date("2024-01-10"),
      purchasePrice: 200000,
      currentValue: 215000,
      category: "Bonds",
      documents: [],
    },
  });

  console.log(`✅ Created 1 asset for ${chama2.name}\n`);

  // ============================================
  // CHAMA 3: Prosperity Chama
  // ============================================
  console.log("📦 Creating Chama 3: Prosperity Chama");

  const chama3 = await prisma.chama.create({
    data: {
      name: "Prosperity Chama",
      email: "info@prosperity.com",
      phone: "+254700555666",
    },
  });

  // Chama 3 Users
  const chama3Admin = await prisma.user.create({
    data: {
      chamaId: chama3.id,
      email: "admin@prosperity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Sarah Kimani",
      phone: "+254708888888",
      role: "ADMIN",
    },
  });

  const chama3Treasurer = await prisma.user.create({
    data: {
      chamaId: chama3.id,
      email: "treasurer@prosperity.com",
      password: await bcrypt.hash("password123", 10),
      name: "David Otieno",
      phone: "+254709999999",
      role: "TREASURER",
    },
  });

  const chama3Member1 = await prisma.user.create({
    data: {
      chamaId: chama3.id,
      email: "jane@prosperity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Jane Wambui",
      phone: "+254710000000",
      role: "MEMBER",
    },
  });

  const chama3Member2 = await prisma.user.create({
    data: {
      chamaId: chama3.id,
      email: "tom@prosperity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Tom Kariuki",
      phone: "+254711111111",
      role: "MEMBER",
    },
  });

  const chama3Member3 = await prisma.user.create({
    data: {
      chamaId: chama3.id,
      email: "lucy@prosperity.com",
      password: await bcrypt.hash("password123", 10),
      name: "Lucy Adhiambo",
      phone: "+254712222222",
      role: "MEMBER",
    },
  });

  console.log(`✅ Created 5 users for ${chama3.name}`);

  // Chama 3 Transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: chama3Admin.id,
        amount: 15000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
        referenceCode: "QEF1GH2IJK",
      },
      {
        userId: chama3Treasurer.id,
        amount: 15000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
        referenceCode: "QEF2GH3IJK",
      },
      {
        userId: chama3Member1.id,
        amount: 15000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
        referenceCode: "QEF3GH4IJK",
      },
      {
        userId: chama3Member2.id,
        amount: 15000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
        referenceCode: "QEF4GH5IJK",
      },
      {
        userId: chama3Member3.id,
        amount: 15000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
        referenceCode: "QEF5GH6IJK",
      },
      {
        userId: chama3Treasurer.id,
        amount: 2000,
        type: "EXPENSE",
        description: "Meeting refreshments",
      },
    ],
  });

  console.log(`✅ Created 6 transactions for ${chama3.name}`);

  // Chama 3 Loans
  const chama3Loan1 = await prisma.loan.create({
    data: {
      borrowerId: chama3Member1.id,
      amount: 30000,
      interestRate: 8,
      durationMonths: 4,
      totalRepayable: 32400,
      balance: 32400,
      status: "APPROVED",
    },
  });

  await prisma.loanGuarantor.createMany({
    data: [
      {
        loanId: chama3Loan1.id,
        userId: chama3Admin.id,
        amount: 15000,
        accepted: true,
      },
      {
        loanId: chama3Loan1.id,
        userId: chama3Member2.id,
        amount: 15000,
        accepted: true,
      },
    ],
  });

  const chama3Loan2 = await prisma.loan.create({
    data: {
      borrowerId: chama3Member2.id,
      amount: 40000,
      interestRate: 8,
      durationMonths: 6,
      totalRepayable: 43200,
      balance: 43200,
      status: "PENDING",
    },
  });

  await prisma.loanGuarantor.createMany({
    data: [
      {
        loanId: chama3Loan2.id,
        userId: chama3Treasurer.id,
        amount: 20000,
        accepted: false,
      },
      {
        loanId: chama3Loan2.id,
        userId: chama3Member3.id,
        amount: 20000,
        accepted: true,
      },
    ],
  });

  console.log(`✅ Created 2 loans with guarantors for ${chama3.name}`);

  // Chama 3 Assets
  await prisma.asset.createMany({
    data: [
      {
        chamaId: chama3.id,
        name: "Rental Apartment",
        description: "2-bedroom apartment in Nairobi",
        purchaseDate: new Date("2023-03-20"),
        purchasePrice: 3500000,
        currentValue: 4200000,
        category: "Real Estate",
        documents: [],
      },
      {
        chamaId: chama3.id,
        name: "SACCO Shares",
        description: "Shares in local SACCO",
        purchaseDate: new Date("2024-01-05"),
        purchasePrice: 150000,
        currentValue: 165000,
        category: "Equity",
        documents: [],
      },
    ],
  });

  console.log(`✅ Created 2 assets for ${chama3.name}\n`);

  // ============================================
  // Summary
  // ============================================
  console.log("═══════════════════════════════════════");
  console.log("✨ MULTITENANCY SEED COMPLETED!");
  console.log("═══════════════════════════════════════\n");

  console.log("📊 Summary:");
  console.log(`   • 3 Chamas created`);
  console.log(`   • 12 Users created (across all chamas)`);
  console.log(`   • 13 Transactions created`);
  console.log(`   • 3 Loans created`);
  console.log(`   • 6 Loan Guarantors created`);
  console.log(`   • 4 Assets created\n`);

  console.log("🔐 Test Credentials:");
  console.log("\n   Chama 1: Sunrise Investment Group");
  console.log("   ├─ Admin:     admin@sunrise.com / password123");
  console.log("   ├─ Treasurer: treasurer@sunrise.com / password123");
  console.log("   └─ Member:    john@sunrise.com / password123");

  console.log("\n   Chama 2: Unity Savings Group");
  console.log("   ├─ Admin:  admin@unity.com / password123");
  console.log("   └─ Member: alice@unity.com / password123");

  console.log("\n   Chama 3: Prosperity Chama");
  console.log("   ├─ Admin:     admin@prosperity.com / password123");
  console.log("   ├─ Treasurer: treasurer@prosperity.com / password123");
  console.log("   └─ Member:    jane@prosperity.com / password123\n");

  console.log("🧪 Multitenancy Test Scenarios:");
  console.log("   1. Login to different chamas and verify data isolation");
  console.log("   2. Check that users only see their chama's members");
  console.log("   3. Verify transactions are filtered by user's chamaId");
  console.log("   4. Test loan guarantor workflow within same chama");
  console.log("   5. Ensure assets are only visible to chama members");
  console.log("   6. Try cross-chama operations (should fail)\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
