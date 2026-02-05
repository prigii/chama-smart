import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const paystackSchema = z.object({
  publicKey: z.string().min(1, "Public Key is required"),
  secretKey: z.string().min(1, "Secret Key is required"),
});

type PaystackFormValues = z.infer<typeof paystackSchema>;

export function PaystackConfigForm() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<PaystackFormValues>({
    resolver: zodResolver(paystackSchema),
    defaultValues: {
      publicKey: "",
      secretKey: "",
    }
  });

  const onSubmit = async (values: PaystackFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "PAYSTACK",
          config: values,
          name: "Paystack"
        }),
      });

      if (response.ok) {
        toast.success("Paystack integration saved successfully!");
      } else {
        toast.error("Failed to save Paystack integration");
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
        <Label htmlFor="publicKey">Public Key</Label>
        <Input id="publicKey" {...register("publicKey")} placeholder="pk_test_..." />
        {errors.publicKey && <p className="text-xs text-red-500">{errors.publicKey.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="secretKey">Secret Key</Label>
        <Input id="secretKey" type="password" {...register("secretKey")} placeholder="sk_test_..." />
        {errors.secretKey && <p className="text-xs text-red-500">{errors.secretKey.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Paystack Credentials
      </Button>
    </form>
  );
}
