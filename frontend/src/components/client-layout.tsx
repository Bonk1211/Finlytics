"use client";

import TopNav from "@/components/topnav";
import { useAppMode } from "@/lib/mode-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { mode } = useAppMode();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // If we are on the root and in AI mode, stay there (it will render chat)
    // Actually, if we are in AI mode, we should probably be on /ai or the root showing chat.
    // The user said "directly show a full page of chatpage".
    if (mode === "ai" && pathname !== "/ai") {
      router.push("/ai");
    }
  }, [mode, pathname, router]);

  return (
    <>
      <TopNav />
      <main className={(mode === "manual" && pathname !== "/ai") ? "main-content" : ""}>
        {children}
      </main>
    </>
  );
}
