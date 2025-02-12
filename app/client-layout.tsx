"use client";

import { AuroraBackground } from "@/components/ui/aurora-background";
import { ReactNode } from "react";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="relative w-full h-screen">
      <AuroraBackground className="absolute inset-0">
        <div className="relative z-10">
          {children}
        </div>
      </AuroraBackground>
    </div>
  );
} 