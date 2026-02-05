import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const bankSchema = z.object({
  bankName: z.string().min(1, "Bank name is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountNumber: z.string().min(1, "Account number is required"),
  apiKey: z.string().optional(),
});

type BankFormValues = z.infer<typeof bankSchema>;

export function BankConfigForm() {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<BankFormValues>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      apiKey: "",
    }
  });

  const onSubmit = async (values: BankFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: values.bankName.includes("KCB") ? "KCB" : "EQUITY",
          config: values,
          name: values.bankName
        }),
      });

      if (response.ok) {
        toast.success("Bank integration saved successfully!");
      } else {
        toast.error("Failed to save bank integration");
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
        <Label>Bank Provider</Label>
        <Select onValueChange={(v) => setValue("bankName", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a bank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="KCB Bank">KCB Bank</SelectItem>
            <SelectItem value="Equity Bank">Equity Bank</SelectItem>
            <SelectItem value="Other Bank">Other Bank</SelectItem>
          </SelectContent>
        </Select>
        {errors.bankName && <p className="text-xs text-red-500">{errors.bankName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountName">Account Name</Label>
        <Input id="accountName" {...register("accountName")} placeholder="CHAMA NAME GROUP" />
        {errors.accountName && <p className="text-xs text-red-500">{errors.accountName.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input id="accountNumber" {...register("accountNumber")} placeholder="0123456789" />
        {errors.accountNumber && <p className="text-xs text-red-500">{errors.accountNumber.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key / Integration ID (If applicable)</Label>
        <Input id="apiKey" type="password" {...register("apiKey")} />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Bank Details
      </Button>
    </form>
  );
}
