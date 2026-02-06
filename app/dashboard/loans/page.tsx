"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getLoans, createLoan, updateLoanStatus, recordLoanRepayment, getUsers, updateLoan, deleteLoan, adjustLoanBalance } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, CheckCircle, XCircle, DollarSign, MoreHorizontal, Edit, Trash2, Scale, AlertTriangle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";

export default function LoansPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "MEMBER";
  const isMember = role === "MEMBER";

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

  const [adjustmentDialog, setAdjustmentDialog] = useState<{ open: boolean; loanId: string; balance: string; note: string }>({
    open: false,
    loanId: "",
    balance: "",
    note: "",
  });

  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; loanId: string }>({
    open: false,
    loanId: "",
  });

  const [editDialog, setEditDialog] = useState<{ open: boolean; loanId: string; amount: string; interest: string; duration: string }>({
    open: false,
    loanId: "",
    amount: "",
    interest: "",
    duration: "",
  });

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await adjustLoanBalance(
      adjustmentDialog.loanId,
      parseFloat(adjustmentDialog.balance),
      adjustmentDialog.note
    );

    if (result.success) {
      setAdjustmentDialog({ ...adjustmentDialog, open: false });
      loadData();
      toast.success("Balance adjusted successfully");
    } else {
      toast.error(String(result.error) || "Failed to adjust balance");
    }
  };

  const handleDeleteLoan = async () => {
    const result = await deleteLoan(deleteDialog.loanId);
    if (result.success) {
      setDeleteDialog({ open: false, loanId: "" });
      loadData();
      toast.success("Loan deleted successfully");
    } else {
      toast.error(String(result.error) || "Failed to delete loan");
    }
  };

  const handleEditLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateLoan(editDialog.loanId, {
      amount: parseFloat(editDialog.amount),
      interestRate: parseFloat(editDialog.interest),
      durationMonths: parseInt(editDialog.duration),
    });

    if (result.success) {
      setEditDialog({ ...editDialog, open: false });
      loadData();
      toast.success("Loan updated successfully");
    } else {
      toast.error(String(result.error) || "Failed to update loan");
    }
  };


  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
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
      toast.success("Loan created successfully");
    } else {
      toast.error(String(result.error) || "Failed to create loan");
    }
  };

  const handleStatusChange = async (loanId: string, status: any) => {
    const result = await updateLoanStatus(loanId, status);
    if (result.success) {
      loadData();
      toast.success(`Loan status updated to ${status}`);
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleRepayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await recordLoanRepayment(
      repaymentDialog.loanId,
      parseFloat(repaymentData.amount),
      repaymentData.referenceCode || undefined
    );
    
    if (result.success) {
      setRepaymentDialog({ open: false, loanId: "" });
      setRepaymentData({ amount: "", referenceCode: "" });
      loadData();
      toast.success("Repayment recorded successfully");
    } else {
      toast.error(String(result.error) || "Failed to record repayment");
    }
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
    if (total <= 0) return 0;
    const paid = total - balance;
    const percentage = (paid / total) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Loans</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage table banking loans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (open && session?.user?.id) {
            setFormData(prev => ({ ...prev, borrowerId: session.user.id }));
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {isMember ? "Request Loan" : "New Loan"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isMember ? "Request Loan" : "Create New Loan"}</DialogTitle>
              <DialogDescription>
                {isMember ? "Submit a loan request for approval" : "Set up a new table banking loan with guarantors"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="borrower">Borrower</Label>
                  {!isMember ? (
                    <Select
                      value={formData.borrowerId}
                      onValueChange={(value) => setFormData({ ...formData, borrowerId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select borrower" />
                      </SelectTrigger>
                      <SelectContent>
                        {session?.user?.id && (
                          <SelectItem value={session.user.id}>
                            Me ({session.user.name})
                          </SelectItem>
                        )}
                        {users
                          .filter(u => u.id !== session?.user?.id)
                          .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input 
                      value={session?.user?.name || "Me"} 
                      disabled 
                      className="bg-gray-100"
                    />
                  )}
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
                  <TableHead className="hidden lg:table-cell">Interest</TableHead>
                  <TableHead className="hidden lg:table-cell">Duration</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead className="hidden md:table-cell">Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const progress = calculateProgress(
                    loan.balance,
                    loan.totalRepayable
                  );

                  return (
                    <TableRow key={loan.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{loan.borrower.name}</p>
                          <p className="text-[10px] text-gray-500 md:hidden truncate max-w-[80px]">{loan.borrower.email}</p>
                          <p className="text-[10px] text-gray-500 hidden md:block">{loan.borrower.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{loan.interestRate}%</TableCell>
                      <TableCell className="hidden lg:table-cell">{loan.durationMonths}mo</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${loan.balance < 0 ? 'text-red-600' : ''}`}>
                              {formatCurrency(loan.balance)}
                            </span>
                            {loan.balance < 0 && (
                              <Badge variant="outline" className="text-[10px] h-4 px-1 text-red-600 border-red-200 bg-red-50">
                                Overpaid
                              </Badge>
                            )}
                          </div>
                          {loan.status !== "PAID" && loan.balance > 0 && (
                            <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                        {loan.dueDate ? formatDate(loan.dueDate) : "-"}
                      </TableCell>
                      <TableCell>

                        {!isMember ? (
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
                        ) : (
                          <Badge variant={getLoanStatusBadge(loan.status)}>
                            {loan.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!isMember && loan.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleStatusChange(loan.id, "APPROVED")}
                              >
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleStatusChange(loan.id, "REJECTED")}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {(["ACTIVE", "APPROVED", "DEFAULTED"].includes(loan.status)) && (!isMember || loan.borrowerId === session?.user?.id) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRepaymentDialog({ open: true, loanId: loan.id })}
                            >
                              <DollarSign className="mr-1 h-3 w-3" />
                              Repay
                            </Button>
                          )}

                          {!isMember && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setEditDialog({ 
                                  open: true, 
                                  loanId: loan.id, 
                                  amount: String(loan.amount),
                                  interest: String(loan.interestRate),
                                  duration: String(loan.durationMonths)
                                })}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setAdjustmentDialog({ 
                                  open: true, 
                                  loanId: loan.id, 
                                  balance: String(loan.balance),
                                  note: ""
                                })}>
                                  <Scale className="mr-2 h-4 w-4" />
                                  Adjust Balance
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => setDeleteDialog({ open: true, loanId: loan.id })}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Loan
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
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

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Loan Details</DialogTitle>
            <DialogDescription>
              Update the primary loan parameters. Note: This does not automatically recalculate balance if interest changed.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditLoan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editAmount">Loan Amount (KES)</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editDialog.amount}
                onChange={(e) => setEditDialog({ ...editDialog, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editInterest">Interest Rate (%)</Label>
              <Input
                id="editInterest"
                type="number"
                step="0.1"
                value={editDialog.interest}
                onChange={(e) => setEditDialog({ ...editDialog, interest: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDuration">Duration (Months)</Label>
              <Input
                id="editDuration"
                type="number"
                value={editDialog.duration}
                onChange={(e) => setEditDialog({ ...editDialog, duration: e.target.value })}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Update Loan
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={adjustmentDialog.open} onOpenChange={(open) => setAdjustmentDialog({ ...adjustmentDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Balance Adjustment</DialogTitle>
            <DialogDescription>
              Directly set the remaining balance. Use this to fix typos in repayments or manual credits.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdjustBalance} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjBalance">New Balance (KES)</Label>
              <Input
                id="adjBalance"
                type="number"
                step="0.01"
                value={adjustmentDialog.balance}
                onChange={(e) => setAdjustmentDialog({ ...adjustmentDialog, balance: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjNote">Reason for Adjustment</Label>
              <Input
                id="adjNote"
                value={adjustmentDialog.note}
                onChange={(e) => setAdjustmentDialog({ ...adjustmentDialog, note: e.target.value })}
                placeholder="e.g., Correcting 50k repayment typo"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
              Apply Adjustment
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Delete Loan Records</DialogTitle>
            </div>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this loan? This action is permanent and will remove all associated guarantor records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, loanId: "" })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteLoan}>
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
