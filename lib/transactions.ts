import { prisma } from "@/lib/prisma";
import { TransactionType } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Centrally processes an incoming payment alert.
 * Attempts to match the alert to a member based on phone number or reference code.
 */
export async function processTransactionAlert(alertId: string) {
  try {
    const alert = await prisma.transactionAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.status !== "PENDING") return;

    // Extract potential identifiers from payload
    const payload = alert.payload as any;
    let phoneNumber = "";
    let reference = alert.externalId; // Paybill reference or M-Pesa receipt

    // M-Pesa specific extraction
    if (alert.provider === "MPESA") {
      const metadata = payload?.Body?.stkCallback?.CallbackMetadata?.Item;
      phoneNumber = metadata?.find((i: any) => i.Name === "PhoneNumber")?.Value?.toString();
    }

    // Try to find a user by phone number
    let matchedUser = null;
    if (phoneNumber) {
      // Clean phone number for matching
      const cleanPhone = phoneNumber.replace("+", "").slice(-9); // Match last 9 digits to be safe
      matchedUser = await prisma.user.findFirst({
        where: {
          phone: {
            contains: cleanPhone,
          },
        },
      });
    }

    if (matchedUser) {
      await prisma.$transaction(async (tx) => {
        // 1. Create the actual transaction
        await tx.transaction.create({
          data: {
            userId: matchedUser.id,
            amount: alert.amount,
            type: "DEPOSIT",
            description: `Automated ${alert.provider} Deposit - Ref: ${reference}`,
            referenceCode: reference || undefined,
          },
        });

        // 2. Update alert status
        await tx.transactionAlert.update({
          where: { id: alertId },
          data: { status: "PROCESSED" },
        });
        
        // 3. Optional: Logic for auto-repayment if they have an active loan
        const activeLoan = await tx.loan.findFirst({
          where: {
            borrowerId: matchedUser.id,
            status: "ACTIVE",
          },
        });

        if (activeLoan) {
          // We could auto-apply this to the loan here, 
          // but usually it's safer to just record it as a deposit 
          // and let the member or treasurer apply it to the loan balance.
          // For now, we'll just log it.
          console.log(`Matched user ${matchedUser.name} has an active loan ${activeLoan.id}`);
        }
      });

      // Clear caches for real-time update
      revalidatePath("/dashboard/wallet");
      revalidatePath("/dashboard/overview");
      console.log(`Successfully auto-matched alert ${alertId} to user ${matchedUser.name}`);
    } else {
      console.log(`Could not auto-match alert ${alertId}. Phone: ${phoneNumber}, Ref: ${reference}`);
    }
  } catch (error) {
    console.error("Error processing transaction alert:", error);
  }
}
