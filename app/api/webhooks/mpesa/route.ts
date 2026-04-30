/**
 * POST /api/webhooks/mpesa
 * Safaricom calls this endpoint after STK Push is completed (success or failure).
 * Updates the TransactionAlert and auto-processes the deposit.
 */

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("[M-Pesa Webhook] Received:", JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    // Extract metadata items (only present on success ResultCode === 0)
    const items: any[] = CallbackMetadata?.Item || [];
    const getItem = (name: string) => items.find((i) => i.Name === name)?.Value;

    const amount = getItem("Amount");
    const receipt = getItem("MpesaReceiptNumber"); // e.g. "QGH7XYZ123"
    const phoneRaw = getItem("PhoneNumber");

    console.log("[M-Pesa Webhook] CheckoutRequestID:", CheckoutRequestID, "ResultCode:", ResultCode);

    // Find existing TransactionAlert created at STK push time
    const existingAlert = await prisma.transactionAlert.findUnique({
      where: { checkoutRequestId: CheckoutRequestID },
    });

    if (ResultCode === 0) {
      // ── Success ──────────────────────────────────────────────────────────────
      if (existingAlert) {
        // Update the existing alert with the receipt and mark it for processing
        await prisma.transactionAlert.update({
          where: { checkoutRequestId: CheckoutRequestID },
          data: {
            externalId: receipt || undefined,
            amount: amount || existingAlert.amount,
            payload: body,
            status: "PENDING", // Will be set to PROCESSED by processTransactionAlert
          },
        });

        // Auto-process: match user and create transaction
        const { processTransactionAlertByCheckout } = await import("@/lib/transactions");
        await processTransactionAlertByCheckout(CheckoutRequestID);
      } else {
        // Fallback: create a new alert if we somehow missed the STK push record
        const alert = await prisma.transactionAlert.create({
          data: {
            externalId: receipt,
            checkoutRequestId: CheckoutRequestID,
            provider: "MPESA",
            amount: amount || 0,
            payload: body,
            status: "PENDING",
          },
        });

        const { processTransactionAlertByCheckout } = await import("@/lib/transactions");
        await processTransactionAlertByCheckout(alert.checkoutRequestId!);
      }
    } else {
      // ── Failed / Cancelled ───────────────────────────────────────────────────
      if (existingAlert) {
        await prisma.transactionAlert.update({
          where: { checkoutRequestId: CheckoutRequestID },
          data: {
            payload: body,
            status: "FAILED",
          },
        });
      }
      console.log(`[M-Pesa Webhook] Payment failed. Code: ${ResultCode} — ${ResultDesc}`);
    }

    // Always respond 200 to Safaricom to acknowledge receipt
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("[M-Pesa Webhook] Error:", error);
    // Still return 200 so Safaricom doesn't retry indefinitely
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Acknowledged" });
  }
}
