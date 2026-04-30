"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Copy, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const mpesaSchema = z.object({
  shortCode: z.string().min(1, "Shortcode / Paybill / Till is required"),
  passkey: z.string().min(1, "LNM Passkey is required"),
  consumerKey: z.string().min(1, "Consumer Key is required"),
  consumerSecret: z.string().min(1, "Consumer Secret is required"),
  accountReference: z.string().optional(),
  transactionType: z.enum(["CustomerPayBillOnline", "CustomerBuyGoodsOnline"]),
  environment: z.enum(["sandbox", "production"]),
});

type MpesaFormValues = z.infer<typeof mpesaSchema>;


interface MpesaConfigFormProps {
  onSaved?: () => void;
}

export function MpesaConfigForm({ onSaved }: MpesaConfigFormProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPasskey, setShowPasskey] = useState(false);
  const [showConsumerKey, setShowConsumerKey] = useState(false);
  const [showConsumerSecret, setShowConsumerSecret] = useState(false);

  const callbackUrl =
    (typeof window !== "undefined" ? window.location.origin : "https://your-domain.com") +
    "/api/webhooks/mpesa";

  const { register, handleSubmit, reset, watch, formState: { errors } } =
    useForm<MpesaFormValues>({
      resolver: zodResolver(mpesaSchema),
      defaultValues: {
        shortCode: "",
        passkey: "",
        consumerKey: "",
        consumerSecret: "",
        accountReference: "",
        transactionType: "CustomerPayBillOnline",
        environment: "sandbox",
      },
    });

  const transactionType = watch("transactionType");

  // Load existing integration config
  useEffect(() => {
    const load = async () => {
      setFetching(true);
      try {
        const res = await fetch("/api/integrations");
        if (res.ok) {
          const data = await res.json();
          const mpesa = data.find((i: any) => i.type === "MPESA");
          if (mpesa) {
            setIntegrationId(mpesa.id);
            reset({
              shortCode: mpesa.config?.shortCode || "",
              passkey: mpesa.config?.passkey || "",
              consumerKey: mpesa.config?.consumerKey || "",
              consumerSecret: mpesa.config?.consumerSecret || "",
              accountReference: mpesa.config?.accountReference || "",
              transactionType: mpesa.config?.transactionType || "CustomerPayBillOnline",
              environment: mpesa.config?.environment || "sandbox",
            });
          }
        }
      } catch (e) {
        console.error("Failed to load integration config", e);
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [reset]);

  const onSubmit = async (values: MpesaFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: integrationId || undefined,
          type: "MPESA",
          config: values,
          name: "M-Pesa (Daraja)",
          isEnabled: true,
        }),
      });

      if (response.ok) {
        const saved = await response.json();
        setIntegrationId(saved.id);
        toast.success("M-Pesa credentials saved successfully! 🎉");
        onSaved?.();
      } else {
        toast.error("Failed to save M-Pesa credentials.");
      }
    } catch {
      toast.error("An error occurred while saving.");
    } finally {
      setLoading(false);
    }
  };

  const copyCallbackUrl = () => {
    navigator.clipboard.writeText(callbackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading configuration...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Environment */}
      <div className="space-y-2">
        <Label>Environment</Label>
        <div className="flex gap-3">
          {(["sandbox", "production"] as const).map((env) => (
            <label
              key={env}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                watch("environment") === env
                  ? "border-green-500 bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300"
                  : "border-muted text-muted-foreground hover:border-foreground/30"
              }`}
            >
              <input type="radio" value={env} {...register("environment")} className="sr-only" />
              {env === "sandbox" ? "🧪 Sandbox" : "🚀 Production"}
            </label>
          ))}
        </div>
        {watch("environment") === "sandbox" && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Sandbox mode — payments are simulated. Switch to Production when ready to go live.
          </p>
        )}
      </div>

      <Separator />

      {/* Transaction Type */}
      <div className="space-y-2">
        <Label>Payment Method</Label>
        <div className="flex gap-3">
          {([
            { value: "CustomerPayBillOnline", label: "Paybill" },
            { value: "CustomerBuyGoodsOnline", label: "Till (Buy Goods)" },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border cursor-pointer text-sm font-medium transition-colors ${
                transactionType === opt.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300"
                  : "border-muted text-muted-foreground hover:border-foreground/30"
              }`}
            >
              <input type="radio" value={opt.value} {...register("transactionType")} className="sr-only" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {/* Shortcode */}
      <div className="space-y-2">
        <Label htmlFor="shortCode">
          {transactionType === "CustomerPayBillOnline" ? "Paybill Number" : "Till Number"}
        </Label>
        <Input
          id="shortCode"
          {...register("shortCode")}
          placeholder={transactionType === "CustomerPayBillOnline" ? "e.g. 522522" : "e.g. 123456"}
        />
        {errors.shortCode && <p className="text-xs text-red-500">{errors.shortCode.message}</p>}
      </div>

      {/* Account Reference (Paybill only) */}
      {transactionType === "CustomerPayBillOnline" && (
        <div className="space-y-2">
          <Label htmlFor="accountReference">Account Number / Reference</Label>
          <Input
            id="accountReference"
            {...register("accountReference")}
            placeholder="e.g. 0123456789 (your chama's bank account number)"
          />
          <p className="text-xs text-muted-foreground">
            This is the account number at your bank (shown on member's M-Pesa receipt).
          </p>
        </div>
      )}

      <Separator />

      {/* Daraja API Credentials */}
      <p className="text-sm font-semibold text-foreground">Daraja API Credentials</p>
      <p className="text-xs text-muted-foreground -mt-3">
        Get these from{" "}
        <a href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer" className="text-blue-500 underline">
          developer.safaricom.co.ke
        </a>
      </p>

      <div className="space-y-2">
        <Label htmlFor="consumerKey">Consumer Key</Label>
        <div className="relative">
          <Input
            id="consumerKey"
            type={showConsumerKey ? "text" : "password"}
            {...register("consumerKey")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConsumerKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConsumerKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.consumerKey && <p className="text-xs text-red-500">{errors.consumerKey.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="consumerSecret">Consumer Secret</Label>
        <div className="relative">
          <Input
            id="consumerSecret"
            type={showConsumerSecret ? "text" : "password"}
            {...register("consumerSecret")}
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConsumerSecret((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConsumerSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.consumerSecret && (
          <p className="text-xs text-red-500">{errors.consumerSecret.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passkey">LNM Passkey (Online Passkey)</Label>
        <div className="relative">
          <Input
            id="passkey"
            type={showPasskey ? "text" : "password"}
            {...register("passkey")}
            placeholder="Lipa Na M-Pesa Online Passkey from Daraja"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPasskey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasskey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.passkey && <p className="text-xs text-red-500">{errors.passkey.message}</p>}
      </div>

      <Separator />

      {/* Callback URL to paste in Daraja */}
      <div className="space-y-2">
        <Label>Callback URL <Badge variant="secondary" className="ml-1 text-xs">Copy into Daraja portal</Badge></Label>
        <div className="flex items-center gap-2">
          <Input
            readOnly
            value={callbackUrl}
            className="font-mono text-xs bg-muted"
          />
          <Button type="button" variant="outline" size="icon" onClick={copyCallbackUrl}>
            {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste this URL in your Daraja app under "Callback URLs" → STK Push Callback.
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {integrationId ? "Update M-Pesa Credentials" : "Save M-Pesa Credentials"}
      </Button>
    </form>
  );
}
