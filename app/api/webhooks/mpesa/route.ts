import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("M-Pesa Webhook Received:", JSON.stringify(body, null, 2));

    const stkCallback = body?.Body?.stkCallback;

    if (!stkCallback) {
      return new NextResponse("Invalid payload", { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Create a transaction alert log
    const amountItem = CallbackMetadata?.Item?.find((i: any) => i.Name === "Amount");
    const receiptItem = CallbackMetadata?.Item?.find((i: any) => i.Name === "MpesaReceiptNumber");
    const phoneItem = CallbackMetadata?.Item?.find((i: any) => i.Name === "PhoneNumber");

    const amount = amountItem?.Value;
    const receipt = receiptItem?.Value;

    if (ResultCode === 0 && receipt) {
      // Save the alert
      const alert = await prisma.transactionAlert.create({
        data: {
          externalId: receipt,
          provider: "MPESA",
          amount: amount || 0,
          payload: body,
          status: "PENDING",
        },
      });

      // Seamlessly process the alert
      const { processTransactionAlert } = await import("@/lib/transactions");
      await processTransactionAlert(alert.id);
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });
  } catch (error) {
    console.error("M-Pesa Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
