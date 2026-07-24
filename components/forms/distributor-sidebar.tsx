"use client";

import { cn } from "@/lib/utils";
import type { DistributorType } from "@/lib/app-context";
import { getDistributorLabel } from "./distributor-selector";

interface DistributorSidebarProps {
  distributors: DistributorType[];
  active: DistributorType | null;
  onSelect: (type: DistributorType) => void;
}

export function DistributorSidebar({ distributors, active, onSelect }: DistributorSidebarProps) {
  return (
    <div className="w-full border-b border-[var(--border)] bg-[var(--sidebar-bg)] lg:w-56 lg:border-b-0 lg:border-r">
      <div className="flex flex-col">
        <div className="border-b border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Distributors</h3>
        </div>
        <nav className="flex gap-2 overflow-x-auto p-4 lg:flex-col lg:overflow-x-visible">
          {distributors.map((distributor) => {
            const isActive = active === distributor;
            return (
              <button
                key={distributor}
                onClick={() => onSelect(distributor)}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-none border px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "border-[var(--ring)] bg-[var(--sidebar-active)] text-[var(--foreground)] shadow-[3px_3px_0px_0px_var(--ring)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]"
                )}
              >
                {getDistributorLabel(distributor)}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
