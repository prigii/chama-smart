/**
 * lib/mpesa.ts
 * Daraja API helpers for M-Pesa STK Push integration.
 * All credentials are loaded per-chama from the Integration DB record.
 */

import { prisma } from "@/lib/prisma";

const SANDBOX_BASE = "https://sandbox.safaricom.co.ke";
const PRODUCTION_BASE = "https://api.safaricom.co.ke";

function getBaseUrl(): string {
  return process.env.MPESA_ENV === "production" ? PRODUCTION_BASE : SANDBOX_BASE;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MpesaConfig {
  consumerKey: string;
  consumerSecret: string;
  shortCode: string;      // Paybill or Till number (receiving)
  passkey: string;        // LNM Passkey from Daraja portal
  accountReference?: string; // e.g. account number at bank
  environment?: "sandbox" | "production";
  // The shortcode type tells M-Pesa how to process:
  // "CustomerPayBillOnline" for Paybill, "CustomerBuyGoodsOnline" for Till
  transactionType?: "CustomerPayBillOnline" | "CustomerBuyGoodsOnline";
}

export interface StkPushParams {
  config: MpesaConfig;
  phone: string;          // Member's phone: 254712345678
  amount: number;         // Amount in KES (whole number)
  description?: string;
  callbackUrl: string;
}

export interface StkPushResult {
  success: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
  rawResponse?: any;
}

export interface StkStatusResult {
  success: boolean;
  status: "PENDING" | "SUCCESS" | "FAILED";
  resultCode?: number;
  resultDesc?: string;
  error?: string;
}

// ─── OAuth Token ──────────────────────────────────────────────────────────────

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getMpesaToken(
  consumerKey: string,
  consumerSecret: string
): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const base = getBaseUrl();

  const response = await fetch(
    `${base}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get M-Pesa token: ${response.status} — ${text}`);
  }

  const data = await response.json();
  const expiresIn = parseInt(data.expires_in || "3600", 10) * 1000;

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + expiresIn,
  };

  return data.access_token;
}

// ─── STK Push ─────────────────────────────────────────────────────────────────

/**
 * Normalise phone to 254XXXXXXXXX format
 */
export function normalisePhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  if (cleaned.startsWith("+254")) return cleaned.slice(1);
  return cleaned;
}

/**
 * Generate the Lipa Na M-Pesa password (Base64 of shortcode + passkey + timestamp)
 */
function generatePassword(shortCode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString("base64");
}

/**
 * Format timestamp as YYYYMMDDHHmmss
 */
function getTimestamp(): string {
  return new Date()
    .toISOString()
    .replace(/[-T:.Z]/g, "")
    .slice(0, 14);
}

/**
 * Initiate STK Push — sends a payment prompt to the member's phone.
 */
export async function initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
  try {
    const { config, phone, amount, description, callbackUrl } = params;
    const token = await getMpesaToken(config.consumerKey, config.consumerSecret);
    const timestamp = getTimestamp();
    const password = generatePassword(config.shortCode, config.passkey, timestamp);
    const normalised = normalisePhone(phone);
    const base = getBaseUrl();

    const transactionType = config.transactionType || "CustomerPayBillOnline";
    const accountRef = config.accountReference || config.shortCode;

    const payload = {
      BusinessShortCode: config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: transactionType,
      Amount: Math.ceil(amount), // M-Pesa requires whole numbers
      PartyA: normalised,         // Customer phone
      PartyB: config.shortCode,   // Receiving shortcode
      PhoneNumber: normalised,    // Phone to receive the STK prompt
      CallBackURL: callbackUrl,
      AccountReference: accountRef,
      TransactionDesc: description || "Chama Contribution",
    };

    console.log("[MPesa STK Push] Initiating:", {
      phone: normalised,
      amount: Math.ceil(amount),
      shortCode: config.shortCode,
      transactionType,
    });

    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("[MPesa STK Push] Response:", data);

    if (data.ResponseCode === "0") {
      return {
        success: true,
        checkoutRequestId: data.CheckoutRequestID,
        merchantRequestId: data.MerchantRequestID,
        rawResponse: data,
      };
    }

    return {
      success: false,
      error: data.ResponseDescription || data.errorMessage || "STK Push failed",
      rawResponse: data,
    };
  } catch (error: any) {
    console.error("[MPesa STK Push] Error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

// ─── STK Status Query ─────────────────────────────────────────────────────────

/**
 * Query the status of a pending STK Push transaction.
 * Used for polling from the frontend (works even without callback URL in dev).
 */
export async function queryStkStatus(
  checkoutRequestId: string,
  config: MpesaConfig
): Promise<StkStatusResult> {
  try {
    const token = await getMpesaToken(config.consumerKey, config.consumerSecret);
    const timestamp = getTimestamp();
    const password = generatePassword(config.shortCode, config.passkey, timestamp);
    const base = getBaseUrl();

    const payload = {
      BusinessShortCode: config.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId,
    };

    const response = await fetch(`${base}/mpesa/stkpushquery/v1/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("[MPesa STK Status]", checkoutRequestId, "→", data);

    // ResultCode 0 = success, 1032 = cancelled/pending, others = failed
    if (data.ResultCode === "0" || data.ResultCode === 0) {
      return { success: true, status: "SUCCESS", resultCode: 0, resultDesc: data.ResultDesc };
    }

    if (data.errorCode === "500.001.1001" || !data.ResultCode) {
      // Still processing / not yet complete
      return { success: true, status: "PENDING", resultDesc: "Processing" };
    }

    return {
      success: true,
      status: "FAILED",
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc || "Payment failed or cancelled",
    };
  } catch (error: any) {
    console.error("[MPesa STK Status] Error:", error);
    return { success: false, status: "FAILED", error: error.message };
  }
}

// ─── Config Loader ────────────────────────────────────────────────────────────

/**
 * Fetch a chama's saved M-Pesa Integration config from DB.
 */
export async function getMpesaIntegrationConfig(
  chamaId: string
): Promise<{ config: MpesaConfig; integrationId: string } | null> {
  try {
    const integration = await prisma.integration.findFirst({
      where: { chamaId, type: "MPESA", isEnabled: true },
    });

    if (!integration) return null;

    const config = integration.config as any;

    // Validate minimum required fields
    if (!config?.consumerKey || !config?.consumerSecret || !config?.shortCode || !config?.passkey) {
      return null;
    }

    return { config: config as MpesaConfig, integrationId: integration.id };
  } catch (error) {
    console.error("[getMpesaConfig] Error:", error);
    return null;
  }
}
