"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo */}
      <div className="flex flex-col gap-5 px-6 py-8 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative h-8 w-8 shrink-0">
            <Image 
              src="/icon.png" 
              alt="App Icon" 
              fill
              className="object-contain"
            />
          </div>
          <span className="text-lg font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-green-600">
            ChamaSmart
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 shrink-0 overflow-hidden">
            {session?.user && (session.user as any).chamaLogo ? (
              <img src={(session.user as any).chamaLogo} alt="Logo" className="h-full w-full object-cover" />
            ) : (
              chamaInitials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-bold text-foreground leading-snug break-words" title={chamaName}>
              {chamaName}
            </h1>
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
              onClick={() => setIsMobileMenuOpen(false)}
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
                <AvatarImage src={session?.user?.avatarUrl || ""} alt={session?.user?.name || "User"} />
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center w-full">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
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
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-20 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            <Image src="/icon.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-green-600">
            ChamaSmart
          </span>
        </div>
        
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 w-64 border-r border-border">
        <SidebarContent />
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="p-4 md:p-8 max-w-[100vw] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
