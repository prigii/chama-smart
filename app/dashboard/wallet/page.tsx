"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getTransactions, createTransaction, getUsers } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowUpCircle, ArrowDownCircle, DollarSign } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

const TRANSACTION_TYPES = [
  { value: "DEPOSIT", label: "Deposit", icon: ArrowUpCircle, color: "text-green-600" },
  { value: "WITHDRAWAL", label: "Withdrawal", icon: ArrowDownCircle, color: "text-red-600" },
  { value: "EXPENSE", label: "Expense", icon: DollarSign, color: "text-orange-600" },
  { value: "FINE", label: "Fine", icon: DollarSign, color: "text-purple-600" },
];

export default function WalletPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "MEMBER";
  const isMember = role === "MEMBER";

  const [transactions, setTransactions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    amount: "",
    type: "DEPOSIT" as any,
    description: "",
    referenceCode: "",
    mpesaPhone: "",
  });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [transactionsResult, usersResult] = await Promise.all([
      getTransactions(),
      getUsers(),
    ]);
    if (transactionsResult.success) {
      setTransactions(transactionsResult.transactions || []);
    }
    if (usersResult.success) {
      setUsers(usersResult.users || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Stub M-Pesa Logic
    if (isMember) {
      toast.info("Initiating M-Pesa STK Push...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("M-Pesa payment received!");
      // Proceed to record
    }

    const result = await createTransaction({
      userId: formData.userId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description || (isMember ? "M-Pesa Contribution" : undefined),
      referenceCode: formData.referenceCode || (isMember ? "MPESA_AUTO_" + Date.now().toString().slice(-6) : undefined),
    });
    if (result.success) {
      setDialogOpen(false);
      setFormData({
        userId: "",
        amount: "",
        type: "DEPOSIT",
        description: "",
        referenceCode: "",
        mpesaPhone: "",
      });
      loadData();
      toast.success("Transaction recorded successfully");
    } else {
      toast.error(String(result.error) || "Failed to record transaction");
    }
  };

  const getTransactionIcon = (type: string) => {
    const txType = TRANSACTION_TYPES.find((t) => t.value === type);
    if (!txType) return null;
    const Icon = txType.icon;
    return <Icon className={`h-4 w-4 ${txType.color}`} />;
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "text-green-600";
      case "WITHDRAWAL":
      case "EXPENSE":
        return "text-red-600";
      default:
        return "text-gray-900";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Wallet</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track all transactions and savings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (open && isMember && session?.user?.id) {
            setFormData(prev => ({
              ...prev,
              userId: session.user.id,
              type: "DEPOSIT",
              description: "Contribution",
            }));
          }
        }}>
          <DialogTrigger asChild>
            <Button className={isMember ? "bg-green-600 hover:bg-green-700" : ""}>
              <Plus className="mr-2 h-4 w-4" />
              {isMember ? "Make Contribution" : "New Transaction"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isMember ? "Make Contribution" : "Record Transaction"}</DialogTitle>
              <DialogDescription>
                {isMember ? "Contribute to your chama wallet via Mobile Money" : "Add a new transaction to the ledger"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isMember && (
                <div className="space-y-2">
                  <Label htmlFor="member">Member</Label>
                  <Select
                    value={formData.userId}
                    onValueChange={(value) => setFormData({ ...formData, userId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {!isMember && (
                <div className="space-y-2">
                  <Label htmlFor="type">Transaction Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSACTION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Monthly contribution"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">{isMember ? "M-Pesa Number" : "M-Pesa Code (Optional)"}</Label>
                <Input
                  id="reference"
                  value={isMember ? formData.mpesaPhone : formData.referenceCode}
                  onChange={(e) => setFormData(isMember 
                    ? { ...formData, mpesaPhone: e.target.value } 
                    : { ...formData, referenceCode: e.target.value }
                  )}
                  placeholder={isMember ? "0712345678" : "e.g., QGH7XYZ123"}
                  required={isMember}
                />
              </div>

              {!isMember && (
                <div className="space-y-2">
                  <Label htmlFor="receipt">Upload Receipt (Optional)</Label>
                  <Input id="receipt" type="file" className="cursor-pointer" />
                </div>
              )}
              <Button type="submit" className="w-full">
                {isMember ? "Pay with M-Pesa" : "Record Transaction"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No transactions yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm text-gray-600">
                      {formatDateTime(transaction.date)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{transaction.user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-sm">
                          {transaction.type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      {transaction.referenceCode || "-"}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${getTransactionColor(transaction.type)}`}>
                      {transaction.type === "DEPOSIT" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
