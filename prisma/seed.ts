import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@chamasmart.com" },
    update: {},
    create: {
      email: "admin@chamasmart.com",
      password: hashedPassword,
      name: "Admin User",
      phone: "+254712345678",
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin.email);

  // Create some demo members
  const member1 = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      email: "john@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "John Kamau",
      phone: "+254722334455",
      role: "MEMBER",
    },
  });

  const member2 = await prisma.user.upsert({
    where: { email: "mary@example.com" },
    update: {},
    create: {
      email: "mary@example.com",
      password: await bcrypt.hash("password123", 10),
      name: "Mary Wanjiku",
      phone: "+254733445566",
      role: "TREASURER",
    },
  });

  console.log("Created demo members");

  // Create some demo transactions
  await prisma.transaction.createMany({
    data: [
      {
        userId: member1.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
      },
      {
        userId: member2.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
      },
      {
        userId: admin.id,
        amount: 5000,
        type: "DEPOSIT",
        description: "Monthly contribution - January",
      },
    ],
  });

  console.log("Created demo transactions");

  // Create a demo asset
  await prisma.asset.create({
    data: {
      name: "Land in Kiambu",
      description: "1/4 acre plot near Thika Road",
      purchaseDate: new Date("2023-06-15"),
      purchasePrice: 500000,
      currentValue: 650000,
      category: "Land",
      documents: [],
    },
  });

  console.log("Created demo asset");

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
