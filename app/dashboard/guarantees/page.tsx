"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getGuarantees, approveGuarantorship } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function GuaranteesPage() {
  const { data: session } = useSession();
  const [guarantees, setGuarantees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const result = await getGuarantees();
    if (result.success) {
      setGuarantees(result.guarantees || []);
    }
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this loan guarantee? You will be liable if the borrower defaults.")) return;
    
    const result = await approveGuarantorship(id);
    if (result.success) {
      toast.success("Guarantorship approved successfully");
      loadData();
    } else {
      toast.error(String(result.error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Guarantees</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage loan requests you have guaranteed</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Guarantorship Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading guarantees...</p>
          ) : guarantees.length === 0 ? (
            <p className="text-center py-8 text-gray-500">You haven't guaranteed any loans yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Loan Amount</TableHead>
                  <TableHead>Guaranteed Amount</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guarantees.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{g.loan.borrower.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{g.loan.borrower.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(g.loan.amount)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(g.amount)}</TableCell>
                    <TableCell>{formatDate(g.loan.createdAt)}</TableCell>
                    <TableCell>
                      {g.accepted ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" /> Approved
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!g.accepted && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleApprove(g.id)}
                        >
                          Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 flex gap-3">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium mb-1">About Guarantees</p>
          <p>By approving a guarantee, you agree to be liable for the guaranteed amount if the borrower defaults on their loan. Your guaranteed amount is locked from your savings until the loan is fully repaid.</p>
        </div>
      </div>
    </div>
  );
}
