import { 
  getDashboardStats, 
  getTransactions, 
  getLoans, 
  getMemberStats, 
  getPendingLoanRequests, 
  getUnprocessedAlerts,
  getGuarantees
} from "@/lib/actions";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  HandCoins, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Building2, 
  ArrowUpRight, 
  ArrowDownRight,
  UserPlus,
  PlusCircle,
  PiggyBank,
  Calendar,
  CreditCard,
  Zap,
  CheckCircle2,
  Smartphone,
  ArrowRight,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import TransactionChart from "@/components/shared/TransactionChart";
import TransactionTypeChart from "@/components/shared/TransactionTypeChart";
import { DashboardRefresh } from "@/components/shared/dashboard-refresh";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  const session = await auth();
  const role = session?.user?.role || "MEMBER";
  const isMember = role === "MEMBER";

  const [
    statsResult,
    transactionsResult,
    loansResult,
    memberStatsResult,
    pendingLoansResult,
    pendingAlertsResult,
    guaranteesResult,
  ] = await Promise.all([
    getDashboardStats(),
    getTransactions(),
    getLoans(),
    isMember ? getMemberStats() : Promise.resolve(null),
    getPendingLoanRequests(),
    !isMember ? getUnprocessedAlerts() : Promise.resolve(null),
    isMember ? getGuarantees() : Promise.resolve(null),
  ]);

  const stats = statsResult.success ? statsResult.stats : null;
  const memberStats = memberStatsResult?.success ? memberStatsResult.stats : null;
  const pendingLoans = pendingLoansResult.success ? (pendingLoansResult.requests ?? []) : [];
  const pendingAlerts = pendingAlertsResult?.success ? (pendingAlertsResult.alerts ?? []) : [];
  const pendingGuarantees = (guaranteesResult?.success ? (guaranteesResult.guarantees ?? []) : []).filter((g: any) => !g?.accepted);
  
  const allTransactions = transactionsResult.success ? (transactionsResult.transactions ?? []) : [];
  const recentLoans = loansResult.success ? (loansResult.loans?.slice(0, 5) ?? []) : [];

  return (
    <div className="space-y-8">
      <DashboardRefresh intervalMs={30000} />
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isMember 
              ? "Welcome back! Here is your summary." 
              : "Welcome back! Here's what's happening with your chama."}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4">
          {!isMember && (
            <Link href="/dashboard/members?action=new">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          )}
          
          <Link href="/dashboard/wallet">
            <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              {isMember ? "Make Contribution" : "Add Transaction"}
            </Button>
          </Link>

          <Link href="/dashboard/loans">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm">
              <HandCoins className="mr-2 h-4 w-4" />
              {isMember ? "Request Loan" : "New Loan"}
            </Button>
          </Link>

          {!isMember && (
            <Link href="/dashboard/investments">
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-sm">
                <Building2 className="mr-2 h-4 w-4" />
                New Asset
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Stats Grid with Icons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {!isMember ? (
          <>
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Cash at Hand
                  </CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.cashAtHand || 0)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Available balance
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Active Loans
                  </CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <HandCoins className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.activeLoans || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ongoing loans</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Members
                  </CardTitle>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalMembers || 0}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered users</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Assets
                  </CardTitle>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <Building2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats?.totalAssets || 0)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Investment value</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    My Total Savings
                  </CardTitle>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <PiggyBank className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(memberStats?.totalSavings || 0)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total deposits</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    My Loan Balance
                  </CardTitle>
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                    <CreditCard className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(memberStats?.loanBalance || 0)}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Outstanding debt</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Next Repayment
                  </CardTitle>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {memberStats?.nextRepayment ? formatDate(memberStats.nextRepayment) : "-"}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Due date</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Overdue Loans Alert - Only visible to admins */}
      {!isMember && stats && (stats.overdueLoans ?? 0) > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <div className="flex-1">
              <p className="font-medium text-orange-900 dark:text-orange-200">
                {stats.overdueLoans ?? 0} loan{(stats.overdueLoans ?? 0) > 1 ? "s" : ""} overdue
              </p>
              <p className="text-sm text-orange-700 dark:text-orange-300">
                Please review and follow up on overdue payments
              </p>
            </div>
            <Link href="/dashboard/loans">
              <Button variant="outline" size="sm" className="border-orange-200 hover:bg-orange-100">
                Review Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Pending Guarantees Alert - Visible to members */}
      {isMember && pendingGuarantees.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="flex items-center gap-3 pt-6">
            <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="flex-1">
              <p className="font-medium text-blue-900 dark:text-blue-200">
                {pendingGuarantees.length} pending guarantorship request{pendingGuarantees.length > 1 ? "s" : ""}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Other members have requested you to guarantee their loans.
              </p>
            </div>
            <Link href="/dashboard/guarantees">
              <Button variant="outline" size="sm" className="border-blue-200 hover:bg-blue-100">
                Review Requests
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Loan Requests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Pending Loan Requests</CardTitle>
              <p className="text-sm text-gray-500">
                {isMember ? "Your submmitted requests" : "Member requests awaiting approval"}
              </p>
            </div>
            <Badge variant="outline" className="h-6">
              {pendingLoans.length}
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingLoans.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2 opacity-20" />
                <p className="text-sm text-gray-500">No pending requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLoans.map((loan: any) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <p className="font-medium text-sm">{loan.borrower.name}</p>
                      <p className="text-xs text-gray-500">{formatCurrency(loan.amount)} • {loan.durationMonths}mo</p>
                    </div>
                    <Link href="/dashboard/loans">
                      <Button size="sm" variant="ghost" className="h-8">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Unprocessed Alerts (Admin) or Wallet Quick Link (Member) */}
        {!isMember ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Automatic Alerts</CardTitle>
                <p className="text-sm text-gray-500">M-Pesa/Bank payments requiring matching</p>
              </div>
              <Badge variant="outline" className="h-6">
                {pendingAlerts.length}
              </Badge>
            </CardHeader>
            <CardContent>
              {pendingAlerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Zap className="h-8 w-8 text-blue-500 mb-2 opacity-20" />
                  <p className="text-sm text-gray-500">System is all synced up</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingAlerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="text-[10px] h-4 px-1">{alert.provider}</Badge>
                          <p className="font-medium text-sm">{formatCurrency(alert.amount)}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Ref: {alert.externalId}</p>
                      </div>
                      <Link href="/dashboard/wallet">
                        <Button size="sm" className="h-8 bg-blue-600 hover:bg-blue-700">
                          Match
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Quick Payment</CardTitle>
              <CardDescription className="text-blue-100 italic">
                Contributions made via M-Pesa reflect on your dashboard instantly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mt-2">
                <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Automatic M-Pesa</p>
                      <p className="text-xs text-blue-100 opacity-80">Use Paybill: 123456</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 opacity-50" />
                </div>
                <Link href="/dashboard/wallet">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold border-none h-12">
                    Open Wallet to Contribute
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>


      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days activity</p>
          </CardHeader>
          <CardContent>
            <TransactionChart transactions={allTransactions || []} />
          </CardContent>
        </Card>

        {/* Transaction Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Distribution</CardTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">By transaction type</p>
          </CardHeader>
          <CardContent>
            <TransactionTypeChart transactions={allTransactions || []} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400">All recent transactions</p>
        </CardHeader>
        <CardContent>
          {(allTransactions?.length ?? 0) === 0 ? (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {allTransactions?.map((transaction: any) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      transaction.type === "DEPOSIT" 
                        ? "bg-green-100 dark:bg-green-900/30" 
                        : transaction.type === "WITHDRAWAL"
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {transaction.type === "DEPOSIT" ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : transaction.type === "WITHDRAWAL" ? (
                        <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.description || transaction.type}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {formatDate(transaction.date)}
                        {transaction.referenceCode && (
                          <span className="ml-2">• {transaction.referenceCode}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${
                      transaction.type === "DEPOSIT" 
                        ? "text-green-600 dark:text-green-400" 
                        : transaction.type === "WITHDRAWAL"
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-900 dark:text-white"
                    }`}>
                      {transaction.type === "DEPOSIT" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <Badge 
                      variant={transaction.type === "DEPOSIT" ? "default" : "secondary"}
                      className="mt-1"
                    >
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
