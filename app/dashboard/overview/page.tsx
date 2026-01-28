import { getDashboardStats, getTransactions, getLoans } from "@/lib/actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Wallet, HandCoins, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardOverviewPage() {
  const statsResult = await getDashboardStats();
  const transactionsResult = await getTransactions();
  const loansResult = await getLoans();

  const stats = statsResult.success ? statsResult.stats : null;
  const recentTransactions = transactionsResult.success 
    ? transactionsResult.transactions?.slice(0, 5) 
    : [];
  const recentLoans = loansResult.success 
    ? loansResult.loans?.slice(0, 5) 
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your chama.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Cash at Hand
            </CardTitle>
            <Wallet className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.cashAtHand || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Loans
            </CardTitle>
            <HandCoins className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.activeLoans || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Members
            </CardTitle>
            <Users className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.totalMembers || 0}
            </div>
            <p className="text-xs text-gray-500 mt-1">Registered members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Assets
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats?.totalAssets || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">Investment value</p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Loans Alert */}
      {stats && stats.overdueLoans > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-900">
                {stats.overdueLoans} loan{stats.overdueLoans > 1 ? "s" : ""} overdue
              </p>
              <p className="text-sm text-orange-700">
                Please review and follow up on overdue payments
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions && recentTransactions.length > 0 ? (
              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {transaction.user.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {transaction.type.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium text-sm ${
                        transaction.type === "DEPOSIT" ? "text-green-600" : "text-gray-900"
                      }`}>
                        {transaction.type === "DEPOSIT" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(transaction.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No transactions yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoans && recentLoans.length > 0 ? (
              <div className="space-y-4">
                {recentLoans.map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900">
                        {loan.borrower.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {loan.durationMonths} months @ {loan.interestRate}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900">
                        {formatCurrency(loan.amount)}
                      </p>
                      <Badge
                        variant={
                          loan.status === "PAID"
                            ? "default"
                            : loan.status === "ACTIVE"
                            ? "secondary"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {loan.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No loans yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
