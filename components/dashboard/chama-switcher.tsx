"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  ChevronsUpDown, 
  Check, 
  PlusCircle, 
  Loader2 
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUserChamas, switchChama } from "@/lib/actions";

export function ChamaSwitcher() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [chamas, setChamas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadChamas() {
      const result = await getUserChamas();
      if (result.success) {
        setChamas(result.chamas || []);
      }
    }
    if (session?.user) {
      loadChamas();
    }
  }, [session]);

  const onSwitch = async (targetUserId: string) => {
    if (targetUserId === session?.user?.id) return;
    
    setSwitchingId(targetUserId);
    
    toast.promise(
      (async () => {
        const result = await switchChama(targetUserId);
        if (!result.success || !result.userData) {
          throw new Error(result.error || "Switch failed");
        }
        
        // Update session with new user data
        await update({
          user: result.userData
        });
        
        // Redirect and refresh
        router.push("/dashboard/overview");
        router.refresh();
        return result.userData.chamaName;
      })(),
      {
        loading: "Switching account context...",
        success: (name) => `Switched to ${name} successfully`,
        error: (err) => `Failed to switch: ${err.message}`,
      }
    );

    setSwitchingId(null);
  };

  const currentChama = chamas.find(c => c.userId === session?.user?.id) || {
    name: session?.user?.chamaName || "ChamaSmart",
    logo: (session?.user as any)?.chamaLogo
  };

  if (chamas.length <= 1) {
    return (
      <div className="flex items-center gap-3 w-full">
        <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 shrink-0 overflow-hidden">
          {currentChama.logo ? (
            <img src={currentChama.logo} alt="Logo" className="h-full w-full object-cover" />
          ) : (
             currentChama.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CS"
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground leading-snug break-words">
            {currentChama.name}
          </h1>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-label="Select a Chama"
          className={cn("w-full justify-between h-auto py-2 px-2 hover:bg-accent/50 group transition-all")}
        >
          <div className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/20 shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
              {currentChama.logo ? (
                <img src={currentChama.logo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                currentChama.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CS"
              )}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Chama</span>
              <span className="text-sm font-bold text-foreground leading-none truncate">
                {currentChama.name}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64 p-2" align="start" side="right" sideOffset={10}>
        <DropdownMenuLabel className="text-xs text-muted-foreground px-2 py-1.5 font-semibold uppercase tracking-wider">
          Switch Organization
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />
        <div className="space-y-1">
          {chamas.map((chama) => (
            <DropdownMenuItem
              key={chama.userId}
              onSelect={() => onSwitch(chama.userId)}
              className={cn(
                "flex items-center gap-3 px-2 py-2 cursor-pointer rounded-lg transition-colors",
                chama.userId === session?.user?.id ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400" : "hover:bg-accent"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden",
                chama.userId === session?.user?.id ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"
              )}>
                {chama.logo ? (
                  <img src={chama.logo} alt={chama.name} className="h-full w-full object-cover" />
                ) : (
                  chama.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CS"
                )}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-semibold truncate leading-tight">{chama.name}</span>
                <span className="text-[10px] text-muted-foreground capitalize leading-none">{chama.role.toLowerCase()}</span>
              </div>
              {chama.userId === session?.user?.id ? (
                <Check className="h-4 w-4 text-blue-600" />
              ) : switchingId === chama.userId ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem asChild>
          <a href="/#auth-section" className="flex items-center gap-3 px-2 py-2 cursor-pointer rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground group">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <PlusCircle className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Join or Create Chama</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
