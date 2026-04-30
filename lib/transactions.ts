import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Process a TransactionAlert by its checkoutRequestId.
 * Uses the saved userId for exact user matching (no phone fuzzy-match needed).
 * Falls back to phone-number matching for webhook-only flows.
 */
export async function processTransactionAlertByCheckout(checkoutRequestId: string) {
  try {
    const alert = await prisma.transactionAlert.findUnique({
      where: { checkoutRequestId },
    });

    if (!alert || alert.status === "PROCESSED") return;

    await processTransactionAlertById(alert.id);
  } catch (error) {
    console.error("[processTransactionAlertByCheckout] Error:", error);
  }
}

/**
 * Process a TransactionAlert by its DB id.
 * Matches a chama member by:
 *  1. userId field (set at STK push time — most accurate)
 *  2. Phone number from M-Pesa callback metadata (fallback)
 */
export async function processTransactionAlertById(alertId: string) {
  try {
    const alert = await prisma.transactionAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.status !== "PENDING") return;

    const payload = alert.payload as any;
    let matchedUserId: string | null = null;
    const reference = alert.externalId; // M-Pesa receipt e.g. "QGH7XYZ123"

    // ── Strategy 1: Use the userId saved at STK push time (most reliable) ──
    if (alert.userId) {
      // Verify user still exists
      const user = await prisma.user.findUnique({ where: { id: alert.userId }, select: { id: true } });
      if (user) matchedUserId = user.id;
    }

    // ── Strategy 2: Phone-number matching from M-Pesa callback ──
    if (!matchedUserId && alert.provider === "MPESA") {
      const metadata = payload?.Body?.stkCallback?.CallbackMetadata?.Item;
      const rawPhone = metadata?.find((i: any) => i.Name === "PhoneNumber")?.Value?.toString();
      if (rawPhone) {
        const cleanPhone = rawPhone.replace("+", "").slice(-9);
        const user = await prisma.user.findFirst({
          where: { phone: { contains: cleanPhone } },
          select: { id: true },
        });
        if (user) matchedUserId = user.id;
      }
    }

    if (!matchedUserId) {
      console.warn(`[processTransactionAlert] No user matched for alert ${alertId}`);
      return;
    }

    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create the transaction record
      await tx.transaction.create({
        data: {
          userId: matchedUserId!,
          amount: alert.amount,
          type: "DEPOSIT",
          description: `M-Pesa Payment${reference ? ` — Ref: ${reference}` : ""}`,
          referenceCode: reference || alert.checkoutRequestId || undefined,
        },
      });

      // Mark alert as processed
      await tx.transactionAlert.update({
        where: { id: alertId },
        data: { status: "PROCESSED" },
      });
    });

    revalidatePath("/dashboard/wallet");
    revalidatePath("/dashboard/overview");
    console.log(`[processTransactionAlert] ✅ Alert ${alertId} processed for user ${matchedUserId}`);
  } catch (error) {
    console.error("[processTransactionAlert] Error:", error);
  }
}

/**
 * Legacy entry point — kept for backward compatibility with existing webhook.
 */
export async function processTransactionAlert(alertId: string) {
  return processTransactionAlertById(alertId);
}
