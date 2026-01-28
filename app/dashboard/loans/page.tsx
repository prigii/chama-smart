"use client";

import { useState, useEffect } from "react";
import { getLoans, createLoan, updateLoanStatus, recordLoanRepayment, getUsers } from "@/lib/actions";
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
import { Plus, CheckCircle, XCircle, DollarSign } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [repaymentDialog, setRepaymentDialog] = useState<{ open: boolean; loanId: string }>({
    open: false,
    loanId: "",
  });
  const [formData, setFormData] = useState({
    borrowerId: "",
    amount: "",
    interestRate: "",
    durationMonths: "",
    guarantor1: "",
    guarantor1Amount: "",
    guarantor2: "",
    guarantor2Amount: "",
  });
  const [repaymentData, setRepaymentData] = useState({
    amount: "",
    referenceCode: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [loansResult, usersResult] = await Promise.all([
      getLoans(),
      getUsers(),
    ]);
    if (loansResult.success) {
      setLoans(loansResult.loans || []);
    }
    if (usersResult.success) {
      setUsers(usersResult.users || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const guarantors = [];
    if (formData.guarantor1 && formData.guarantor1Amount) {
      guarantors.push({
        userId: formData.guarantor1,
        amount: parseFloat(formData.guarantor1Amount),
      });
    }
    if (formData.guarantor2 && formData.guarantor2Amount) {
      guarantors.push({
        userId: formData.guarantor2,
        amount: parseFloat(formData.guarantor2Amount),
      });
    }

    const result = await createLoan({
      borrowerId: formData.borrowerId,
      amount: parseFloat(formData.amount),
      interestRate: parseFloat(formData.interestRate),
      durationMonths: parseInt(formData.durationMonths),
      guarantors,
    });

    if (result.success) {
      setDialogOpen(false);
      setFormData({
        borrowerId: "",
        amount: "",
        interestRate: "",
        durationMonths: "",
        guarantor1: "",
        guarantor1Amount: "",
        guarantor2: "",
        guarantor2Amount: "",
      });
      loadData();
    }
  };

  const handleStatusChange = async (loanId: string, status: any) => {
    await updateLoanStatus(loanId, status);
    loadData();
  };

  const handleRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await recordLoanRepayment(
      repaymentDialog.loanId,
      parseFloat(repaymentData.amount),
      repaymentData.referenceCode || undefined
    );
    setRepaymentDialog({ open: false, loanId: "" });
    setRepaymentData({ amount: "", referenceCode: "" });
    loadData();
  };

  const getLoanStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: "outline",
      APPROVED: "secondary",
      ACTIVE: "default",
      PAID: "default",
      REJECTED: "destructive",
      DEFAULTED: "destructive",
    };
    return variants[status] || "outline";
  };

  const calculateProgress = (balance: number, total: number) => {
    const paid = total - balance;
    return (paid / total) * 100;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loans</h1>
          <p className="text-gray-600 mt-1">Manage table banking loans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Loan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Loan</DialogTitle>
              <DialogDescription>
                Set up a new table banking loan with guarantors
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="borrower">Borrower</Label>
                  <Select
                    value={formData.borrowerId}
                    onValueChange={(value) => setFormData({ ...formData, borrowerId: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select borrower" />
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
                  <Label htmlFor="amount">Loan Amount (KES)</Label>
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
                  <Label htmlFor="interest">Interest Rate (%)</Label>
                  <Input
                    id="interest"
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="duration">Duration (Months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guarantor1">Guarantor 1</Label>
                  <Select
                    value={formData.guarantor1}
                    onValueChange={(value) => setFormData({ ...formData, guarantor1: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guarantor" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.id !== formData.borrowerId)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guarantor1Amount">Amount Guaranteed</Label>
                  <Input
                    id="guarantor1Amount"
                    type="number"
                    step="0.01"
                    value={formData.guarantor1Amount}
                    onChange={(e) => setFormData({ ...formData, guarantor1Amount: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guarantor2">Guarantor 2 (Optional)</Label>
                  <Select
                    value={formData.guarantor2}
                    onValueChange={(value) => setFormData({ ...formData, guarantor2: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select guarantor" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((u) => u.id !== formData.borrowerId && u.id !== formData.guarantor1)
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guarantor2Amount">Amount Guaranteed</Label>
                  <Input
                    id="guarantor2Amount"
                    type="number"
                    step="0.01"
                    value={formData.guarantor2Amount}
                    onChange={(e) => setFormData({ ...formData, guarantor2Amount: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Create Loan
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading loans...</p>
          ) : loans.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No loans yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const progress = calculateProgress(
                    loan.balance.toNumber(),
                    loan.totalRepayable.toNumber()
                  );

                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-gray-900">{loan.borrower.name}</p>
                          <p className="text-xs text-gray-500">{loan.borrower.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell>{loan.interestRate}%</TableCell>
                      <TableCell>{loan.durationMonths} months</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{formatCurrency(loan.balance)}</p>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {loan.dueDate ? formatDate(loan.dueDate) : "-"}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={loan.status}
                          onValueChange={(value: any) => handleStatusChange(loan.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                            <SelectItem value="DEFAULTED">Defaulted</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        {loan.status === "ACTIVE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRepaymentDialog({ open: true, loanId: loan.id })}
                          >
                            <DollarSign className="mr-1 h-3 w-3" />
                            Repay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Repayment Dialog */}
      <Dialog open={repaymentDialog.open} onOpenChange={(open) => setRepaymentDialog({ ...repaymentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Loan Repayment</DialogTitle>
            <DialogDescription>
              Record a payment towards this loan
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRepayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repayAmount">Repayment Amount (KES)</Label>
              <Input
                id="repayAmount"
                type="number"
                step="0.01"
                value={repaymentData.amount}
                onChange={(e) => setRepaymentData({ ...repaymentData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repayReference">M-Pesa Code (Optional)</Label>
              <Input
                id="repayReference"
                value={repaymentData.referenceCode}
                onChange={(e) => setRepaymentData({ ...repaymentData, referenceCode: e.target.value })}
                placeholder="e.g., QGH7XYZ123"
              />
            </div>
            <Button type="submit" className="w-full">
              Record Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
