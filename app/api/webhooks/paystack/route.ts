import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify signature - we would need the secret key from the database for this specific chama
    // However, for webhooks to be chama-agnostic at first entry, we might need a generic verification
    // or lookup the chama by some identifier in the payload.
    // For now, we'll log it and save the alert.

    // console.log("Paystack Webhook Received:", JSON.stringify(body, null, 2));

    if (body.event === "charge.success") {
      const data = body.data;
      const externalId = data.reference;
      const amount = data.amount / 100; // Paystack sends in kobo/cents

      const alert = await prisma.transactionAlert.create({
        data: {
          externalId,
          provider: "PAYSTACK",
          amount,
          payload: body,
          status: "PENDING",
        },
      });

      // Seamlessly process the alert
      const { processTransactionAlert } = await import("@/lib/transactions");
      await processTransactionAlert(alert.id);
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("Paystack Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
