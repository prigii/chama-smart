/**
 * POST /api/mpesa/stk-status
 * Polls the status of a pending STK Push by checkoutRequestId.
 * Frontend calls this every 3s after initiating a push.
 * Works both via Daraja query API AND by checking our TransactionAlert record
 * (which is updated by the webhook on callback), making it robust in dev
 * (no public callback URL needed) and production alike.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { queryStkStatus, getMpesaIntegrationConfig } from "@/lib/mpesa";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { checkoutRequestId } = await req.json();

    if (!checkoutRequestId) {
      return NextResponse.json({ error: "checkoutRequestId is required" }, { status: 400 });
    }

    // ── 1. Check our DB first (fastest path; updated by webhook on real callback) ──
    const alert = await prisma.transactionAlert.findUnique({
      where: { checkoutRequestId },
    });

    if (!alert) {
      return NextResponse.json({ error: "Payment session not found" }, { status: 404 });
    }

    // Security: ensure this alert belongs to the calling user
    if (alert.userId && alert.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (alert.status === "PROCESSED") {
      return NextResponse.json({
        status: "SUCCESS",
        receiptNumber: alert.externalId,
        amount: alert.amount.toNumber(),
      });
    }

    if (alert.status === "FAILED") {
      return NextResponse.json({ status: "FAILED", message: "Payment was cancelled or failed." });
    }

    // ── 2. Alert still PENDING — query Daraja directly for up-to-date status ──
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { chamaId: true },
    });

    if (!user?.chamaId) {
      return NextResponse.json({ status: "PENDING" }); // fallback
    }

    const mpesaData = await getMpesaIntegrationConfig(user.chamaId);
    if (!mpesaData) {
      // No config — just report pending (webhook will update DB when it arrives)
      return NextResponse.json({ status: "PENDING" });
    }

    const queryResult = await queryStkStatus(checkoutRequestId, mpesaData.config);

    if (queryResult.status === "SUCCESS") {
      // Webhook should handle DB update when Safaricom calls back,
      // but mark PROCESSED here as a safety net in case callback is delayed.
      await prisma.transactionAlert.update({
        where: { checkoutRequestId },
        data: { status: "PROCESSED" },
      });

      // Auto-record the transaction immediately (don't wait for webhook)
      try {
        const { processTransactionAlertByCheckout } = await import("@/lib/transactions");
        await processTransactionAlertByCheckout(checkoutRequestId);
      } catch (e) {
        console.warn("[STK Status] processTransactionAlertByCheckout failed:", e);
      }

      return NextResponse.json({
        status: "SUCCESS",
        amount: alert.amount.toNumber(),
      });
    }

    if (queryResult.status === "FAILED") {
      await prisma.transactionAlert.update({
        where: { checkoutRequestId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({
        status: "FAILED",
        message: queryResult.resultDesc || "Payment was cancelled.",
      });
    }

    // Still PENDING
    return NextResponse.json({ status: "PENDING" });
  } catch (error: any) {
    console.error("[STK Status Route] Error:", error);
    return NextResponse.json({ status: "PENDING" }); // safe fallback — keep polling
  }
}
