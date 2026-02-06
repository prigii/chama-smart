import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { MpesaConfigForm } from "./mpesa-config-form";
import { PaystackConfigForm } from "./paystack-config-form";
import { BankConfigForm } from "./bank-config-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface IntegrationCardProps {
  title: string;
  description: string;
  type: "MPESA" | "PAYSTACK" | "BANK";
  icon: React.ReactNode;
}

export function IntegrationCard({ title, description, type, icon }: IntegrationCardProps) {
  const [isConnected, setIsConnected] = useState(false); // This should be fetched from API

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isConnected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">Not Connected</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col pt-4">
        <CardDescription className="flex-1">{description}</CardDescription>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={isConnected ? "outline" : "default"} className="w-full mt-4">
              {isConnected ? "Configure" : "Connect Now"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isConnected ? "Configure" : "Connect"} {title}</DialogTitle>
              <DialogDescription>
                Provide your API credentials and settings for {title}.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {type === "MPESA" && <MpesaConfigForm />}
              {type === "PAYSTACK" && <PaystackConfigForm />}
              {type === "BANK" && <BankConfigForm />}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
