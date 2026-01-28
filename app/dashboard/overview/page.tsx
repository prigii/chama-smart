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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your chama.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Cash at Hand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats?.cashAtHand || 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.activeLoans || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ongoing loans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats?.totalMembers || 0}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(stats?.totalAssets || 0)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Investment value</p>
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
            {recentTransactions.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction: any) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === "DEPOSIT" 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {transaction.type === "DEPOSIT" ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          {transaction.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === "DEPOSIT" ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-white"
                    }`}>
                      {transaction.type === "DEPOSIT" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Loans */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Loans</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLoans.length === 0 ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">No loans yet</p>
            ) : (
              <div className="space-y-4">
                {recentLoans.map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {loan.borrower.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Due: {formatDate(loan.dueDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm text-gray-900 dark:text-white">
                        {formatCurrency(loan.amount)}
                      </p>
                      <p className={`text-xs ${
                        loan.status === "ACTIVE" ? "text-blue-600 dark:text-blue-400" : 
                        loan.status === "PAID" ? "text-green-600 dark:text-green-400" : 
                        "text-gray-500 dark:text-gray-400"
                      }`}>
                        {loan.status}
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
