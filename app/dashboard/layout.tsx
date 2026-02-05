"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Users,
  Wallet,
  HandCoins,
  TrendingUp,
  LogOut,
  Settings,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const adminNavigation = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Loans", href: "/dashboard/loans", icon: HandCoins },
  { name: "Assets", href: "/dashboard/investments", icon: TrendingUp },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const memberNavigation = [
  { name: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "My Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Request Loan", href: "/dashboard/loans", icon: HandCoins },
  { name: "My Guarantees", href: "/dashboard/guarantees", icon: CheckCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Get chama name from session, fallback to ChamaSmart
  const chamaName = session?.user?.chamaName || "ChamaSmart";

  // Get initials from chama name for avatar in sidebar
  const chamaInitials = chamaName
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "CS";

  // Get user initials for user dropdown
  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const isMember = session?.user?.role === "MEMBER";
  const navigation = isMember ? memberNavigation : adminNavigation;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex flex-col gap-4 px-6 py-6 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="relative h-6 w-6 shrink-0 opacity-80">
                <Image 
                  src="/icon.png" 
                  alt="App Icon" 
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-xs font-semibold tracking-wider uppercase text-muted-foreground/80">
                chamasmart
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20">
                {chamaInitials}
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground leading-tight line-clamp-2" title={chamaName}>
                  {chamaName}
                </h1>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">Investment Group</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground">
                      {session?.user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {session?.user?.role?.toLowerCase() || "Member"}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center">
                      Theme
                    </span>
                    <ThemeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
