import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🗑️  Clearing all data from database...\n");

  // Delete in correct order to respect foreign key constraints
  console.log("Deleting LoanGuarantors...");
  await prisma.loanGuarantor.deleteMany({});
  
  console.log("Deleting Loans...");
  await prisma.loan.deleteMany({});
  
  console.log("Deleting Transactions...");
  await prisma.transaction.deleteMany({});
  
  console.log("Deleting Assets...");
  await prisma.asset.deleteMany({});
  
  console.log("Deleting Users...");
  await prisma.user.deleteMany({});
  
  console.log("Deleting Chamas...");
  await prisma.chama.deleteMany({});

  console.log("\n✅ Database cleared successfully!\n");
}

main()
  .catch((e) => {
    console.error("❌ Error clearing database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
