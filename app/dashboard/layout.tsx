"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { getUsers } from "@/lib/actions";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Members", href: "/dashboard/members", icon: Users },
  { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
  { name: "Loans", href: "/dashboard/loans", icon: HandCoins },
  { name: "Investments", href: "/dashboard/investments", icon: TrendingUp },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [chamaName, setChamaName] = useState("ChamaSmart");

  useEffect(() => {
    const fetchChamaName = async () => {
      // If the current user is the admin (Chama), use their name immediately
      if (session?.user?.role === "ADMIN" && session.user.name) {
        setChamaName(session.user.name);
        return;
      }

      // If member, fetch users to find the Admin's name (which is the Chama Name)
      try {
        const result = await getUsers();
        if (result.success && result.users) {
          const admin = result.users.find((u: any) => u.role === "ADMIN");
          if (admin && admin.name) {
            setChamaName(admin.name);
          }
        }
      } catch (error) {
        console.error("Failed to fetch chama name", error);
      }
    };

    if (session) {
      fetchChamaName();
    }
  }, [session]);

  const userInitials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 py-5 border-b border-border">
            <div className="relative h-10 w-10 shrink-0">
               {/* shrink-0 to prevent logo squishing if name is long */}
              <Image 
                src="/logo.png" 
                alt="Chama Logo" 
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight line-clamp-2" title={chamaName}>
                {chamaName}
              </h1>
              <p className="text-xs text-muted-foreground">Investment Group</p>
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
