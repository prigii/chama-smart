"use client";

import { useState, useEffect } from "react";
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

const TRANSACTION_TYPES = [
  { value: "DEPOSIT", label: "Deposit", icon: ArrowUpCircle, color: "text-green-600" },
  { value: "WITHDRAWAL", label: "Withdrawal", icon: ArrowDownCircle, color: "text-red-600" },
  { value: "EXPENSE", label: "Expense", icon: DollarSign, color: "text-orange-600" },
  { value: "FINE", label: "Fine", icon: DollarSign, color: "text-purple-600" },
];

export default function WalletPage() {
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
  });

  useEffect(() => {
    loadData();
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
    const result = await createTransaction({
      userId: formData.userId,
      amount: parseFloat(formData.amount),
      type: formData.type,
      description: formData.description || undefined,
      referenceCode: formData.referenceCode || undefined,
    });
    if (result.success) {
      setDialogOpen(false);
      setFormData({
        userId: "",
        amount: "",
        type: "DEPOSIT",
        description: "",
        referenceCode: "",
      });
      loadData();
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
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-1">Track all transactions and savings</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
              <DialogDescription>
                Add a new transaction to the ledger
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="reference">M-Pesa Code (Optional)</Label>
                <Input
                  id="reference"
                  value={formData.referenceCode}
                  onChange={(e) => setFormData({ ...formData, referenceCode: e.target.value })}
                  placeholder="e.g., QGH7XYZ123"
                />
              </div>
              <Button type="submit" className="w-full">
                Record Transaction
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
                        <p className="font-medium text-gray-900">{transaction.user.name}</p>
                        <p className="text-xs text-gray-500">{transaction.user.email}</p>
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
                    <TableCell className="text-sm text-gray-600">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-gray-600">
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
