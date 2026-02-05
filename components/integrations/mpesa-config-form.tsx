import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const mpesaSchema = z.object({
  shortCode: z.string().min(1, "Shortcode is required"),
  passkey: z.string().min(1, "Passkey is required"),
  consumerKey: z.string().min(1, "Consumer Key is required"),
  consumerSecret: z.string().min(1, "Consumer Secret is required"),
});

type MpesaFormValues = z.infer<typeof mpesaSchema>;

export function MpesaConfigForm() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<MpesaFormValues>({
    resolver: zodResolver(mpesaSchema),
    defaultValues: {
      shortCode: "",
      passkey: "",
      consumerKey: "",
      consumerSecret: "",
    }
  });

  const onSubmit = async (values: MpesaFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "MPESA",
          config: values,
          name: "M-Pesa (Daraja)"
        }),
      });

      if (response.ok) {
        toast.success("M-Pesa integration saved successfully!");
      } else {
        toast.error("Failed to save M-Pesa integration");
      }
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="shortCode">Shortcode / Paybill / Till</Label>
        <Input id="shortCode" {...register("shortCode")} placeholder="e.g. 174379" />
        {errors.shortCode && <p className="text-xs text-red-500">{errors.shortCode.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="passkey">LNM Passkey</Label>
        <Input id="passkey" type="password" {...register("passkey")} placeholder="Lipa Na Mpesa Online Passkey" />
        {errors.passkey && <p className="text-xs text-red-500">{errors.passkey.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="consumerKey">Consumer Key</Label>
          <Input id="consumerKey" type="password" {...register("consumerKey")} />
          {errors.consumerKey && <p className="text-xs text-red-500">{errors.consumerKey.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="consumerSecret">Consumer Secret</Label>
          <Input id="consumerSecret" type="password" {...register("consumerSecret")} />
          {errors.consumerSecret && <p className="text-xs text-red-500">{errors.consumerSecret.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save M-Pesa Credentials
      </Button>
    </form>
  );
}
