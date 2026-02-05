"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface DashboardRefreshProps {
  intervalMs?: number;
}

/**
 * A client component that triggers a router refresh at a fixed interval.
 * This ensures that server components are re-fetched and updated without a full page reload.
 */
export function DashboardRefresh({ intervalMs = 30000 }: DashboardRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return null;
}
