"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole, TransactionType, LoanStatus } from "@prisma/client";

// ============ USER ACTIONS ============

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: UserRole;
}) {
  try {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        phone: data.phone,
        role: data.role || "MEMBER",
      },
    });

    revalidatePath("/dashboard/members");
    return { success: true, user: { id: user.id, email: user.email, name: user.name } };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            loans: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, error: "Failed to update user role" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: "Failed to delete user" };
  }
}

// ============ TRANSACTION ACTIONS ============

export async function createTransaction(data: {
  userId: string;
  amount: number;
  type: TransactionType;
  description?: string;
  referenceCode?: string;
}) {
  try {
    const transaction = await prisma.transaction.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        type: data.type,
        description: data.description,
        referenceCode: data.referenceCode,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/wallet");
    return { success: true, transaction };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, error: "Failed to create transaction" };
  }
}

export async function getTransactions(userId?: string) {
  try {
    const transactions = await prisma.transaction.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 100,
    });

    return { success: true, transactions };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { success: false, error: "Failed to fetch transactions" };
  }
}

export async function getTransactionStats() {
  try {
    const [totalDeposits, totalWithdrawals, totalExpenses, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: "DEPOSIT" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "WITHDRAWAL" },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "EXPENSE" },
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: {
          date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
    ]);

    const cashAtHand = 
      (totalDeposits._sum.amount?.toNumber() || 0) - 
      (totalWithdrawals._sum.amount?.toNumber() || 0) - 
      (totalExpenses._sum.amount?.toNumber() || 0);

    return {
      success: true,
      stats: {
        totalDeposits: totalDeposits._sum.amount?.toNumber() || 0,
        totalWithdrawals: totalWithdrawals._sum.amount?.toNumber() || 0,
        totalExpenses: totalExpenses._sum.amount?.toNumber() || 0,
        cashAtHand,
        recentTransactions,
      },
    };
  } catch (error) {
    console.error("Error fetching transaction stats:", error);
    return { success: false, error: "Failed to fetch transaction stats" };
  }
}

// ============ LOAN ACTIONS ============

export async function createLoan(data: {
  borrowerId: string;
  amount: number;
  interestRate: number;
  durationMonths: number;
  guarantors: { userId: string; amount: number }[];
}) {
  try {
    const totalRepayable = data.amount * (1 + data.interestRate / 100);
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + data.durationMonths);

    const loan = await prisma.loan.create({
      data: {
        borrowerId: data.borrowerId,
        amount: data.amount,
        interestRate: data.interestRate,
        durationMonths: data.durationMonths,
        totalRepayable,
        balance: totalRepayable,
        dueDate,
        guarantors: {
          create: data.guarantors.map((g) => ({
            userId: g.userId,
            amount: g.amount,
          })),
        },
      },
      include: {
        borrower: {
          select: {
            name: true,
            email: true,
          },
        },
        guarantors: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/loans");
    return { success: true, loan };
  } catch (error) {
    console.error("Error creating loan:", error);
    return { success: false, error: "Failed to create loan" };
  }
}

export async function getLoans(userId?: string) {
  try {
    const loans = await prisma.loan.findMany({
      where: userId ? { borrowerId: userId } : undefined,
      include: {
        borrower: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        guarantors: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, loans };
  } catch (error) {
    console.error("Error fetching loans:", error);
    return { success: false, error: "Failed to fetch loans" };
  }
}

export async function updateLoanStatus(loanId: string, status: LoanStatus) {
  try {
    const loan = await prisma.loan.update({
      where: { id: loanId },
      data: { status },
    });

    // If approved, create a disbursement transaction
    if (status === "APPROVED" || status === "ACTIVE") {
      await prisma.transaction.create({
        data: {
          userId: loan.borrowerId,
          amount: loan.amount,
          type: "LOAN_DISBURSEMENT",
          description: `Loan disbursement - ${loanId}`,
        },
      });
    }

    revalidatePath("/dashboard/loans");
    return { success: true };
  } catch (error) {
    console.error("Error updating loan status:", error);
    return { success: false, error: "Failed to update loan status" };
  }
}

export async function recordLoanRepayment(loanId: string, amount: number, referenceCode?: string) {
  try {
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
    });

    if (!loan) {
      return { success: false, error: "Loan not found" };
    }

    const newBalance = loan.balance.toNumber() - amount;

    await prisma.$transaction([
      prisma.loan.update({
        where: { id: loanId },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? "PAID" : loan.status,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: loan.borrowerId,
          amount,
          type: "LOAN_REPAYMENT",
          description: `Loan repayment - ${loanId}`,
          referenceCode,
        },
      }),
    ]);

    revalidatePath("/dashboard/loans");
    return { success: true };
  } catch (error) {
    console.error("Error recording loan repayment:", error);
    return { success: false, error: "Failed to record loan repayment" };
  }
}

export async function approveGuarantorship(guarantorId: string) {
  try {
    await prisma.loanGuarantor.update({
      where: { id: guarantorId },
      data: { accepted: true },
    });

    revalidatePath("/dashboard/loans");
    return { success: true };
  } catch (error) {
    console.error("Error approving guarantorship:", error);
    return { success: false, error: "Failed to approve guarantorship" };
  }
}

export async function getLoanStats() {
  try {
    const [activeLoans, totalDisbursed, totalRepaid, overdueLoans] = await Promise.all([
      prisma.loan.count({
        where: { status: "ACTIVE" },
      }),
      prisma.loan.aggregate({
        where: { status: { in: ["ACTIVE", "PAID"] } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "LOAN_REPAYMENT" },
        _sum: { amount: true },
      }),
      prisma.loan.count({
        where: {
          status: "ACTIVE",
          dueDate: {
            lt: new Date(),
          },
        },
      }),
    ]);

    return {
      success: true,
      stats: {
        activeLoans,
        totalDisbursed: totalDisbursed._sum.amount?.toNumber() || 0,
        totalRepaid: totalRepaid._sum.amount?.toNumber() || 0,
        overdueLoans,
      },
    };
  } catch (error) {
    console.error("Error fetching loan stats:", error);
    return { success: false, error: "Failed to fetch loan stats" };
  }
}

// ============ ASSET ACTIONS ============

export async function createAsset(data: {
  name: string;
  description?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  category: string;
  documents?: string[];
}) {
  try {
    const asset = await prisma.asset.create({
      data,
    });

    revalidatePath("/dashboard/investments");
    return { success: true, asset };
  } catch (error) {
    console.error("Error creating asset:", error);
    return { success: false, error: "Failed to create asset" };
  }
}

export async function getAssets() {
  try {
    const assets = await prisma.asset.findMany({
      orderBy: {
        purchaseDate: "desc",
      },
    });

    return { success: true, assets };
  } catch (error) {
    console.error("Error fetching assets:", error);
    return { success: false, error: "Failed to fetch assets" };
  }
}

export async function updateAssetValue(assetId: string, currentValue: number) {
  try {
    await prisma.asset.update({
      where: { id: assetId },
      data: { currentValue },
    });

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error) {
    console.error("Error updating asset value:", error);
    return { success: false, error: "Failed to update asset value" };
  }
}

export async function deleteAsset(assetId: string) {
  try {
    await prisma.asset.delete({
      where: { id: assetId },
    });

    revalidatePath("/dashboard/investments");
    return { success: true };
  } catch (error) {
    console.error("Error deleting asset:", error);
    return { success: false, error: "Failed to delete asset" };
  }
}

// ============ DASHBOARD STATS ============

export async function getDashboardStats() {
  try {
    const [transactionStats, loanStats, memberCount, assets] = await Promise.all([
      getTransactionStats(),
      getLoanStats(),
      prisma.user.count(),
      prisma.asset.aggregate({
        _sum: { currentValue: true },
      }),
    ]);

    return {
      success: true,
      stats: {
        cashAtHand: transactionStats.success ? transactionStats.stats?.cashAtHand : 0,
        activeLoans: loanStats.success ? loanStats.stats?.activeLoans : 0,
        totalMembers: memberCount,
        totalAssets: assets._sum.currentValue?.toNumber() || 0,
        overdueLoans: loanStats.success ? loanStats.stats?.overdueLoans : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return { success: false, error: "Failed to fetch dashboard stats" };
  }
}
