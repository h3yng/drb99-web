"use client";

import { cn } from "@/lib/utils";
import type { DistributorType } from "@/lib/app-context";

interface DistributorOption {
  id: DistributorType;
  label: string;
  description: string;
  iconPath: string;
}

const DISTRIBUTORS: DistributorOption[] = [
  {
    id: "npm_wrapper",
    label: "NPM Wrapper",
    description: "Create an npm wrapper around your Go binary",
    iconPath: "/icons/npm-wrapper.svg",
  },
  {
    id: "goreleaser",
    label: "GoReleaser",
    description: "Generate GoReleaser configuration",
    iconPath: "/icons/go-releaser.svg",
  },
  {
    id: "aur",
    label: "AUR",
    description: "Build PKGBUILD and aur.yaml",
    iconPath: "/icons/aur.svg",
  },
  {
    id: "nix",
    label: "Nix Flake",
    description: "Generate Nix Flake configuration",
    iconPath: "/icons/nix.svg",
  },
];

interface DistributorSelectorProps {
  selected: Set<DistributorType>;
  onChange: (type: DistributorType) => void;
}

export function DistributorSelector({ selected, onChange }: DistributorSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {DISTRIBUTORS.map((distributor) => {
        const isSelected = selected.has(distributor.id);

        return (
          <button
            key={distributor.id}
            onClick={() => onChange(distributor.id)}
            className="group flex min-h-32 flex-col justify-between border px-4 py-4 text-left transition-all duration-150 cursor-pointer active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
            style={{
              borderColor: isSelected ? "var(--ring)" : "var(--border)",
              background: isSelected ? "var(--surface)" : "var(--card)",
              color: "var(--foreground)",
              boxShadow: isSelected
                ? "3px 3px 0px 0px var(--ring)"
                : "none",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <img
                src={distributor.iconPath}
                alt={distributor.label}
                className={cn(
                  "h-7 w-7 object-contain",
                  isSelected ? "opacity-95" : "opacity-70"
                )}
              />
              <span
                className="inline-block border px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                style={{
                  borderColor: isSelected ? "var(--ring)" : "var(--input)",
                  color: "var(--muted-foreground)",
                }}
              >
                {isSelected ? "Selected" : "Select"}
              </span>
            </div>

            <div className="text-left">
              <h3 className="text-sm font-medium transition-colors" style={{ color: "var(--foreground)" }}>
                {distributor.label}
              </h3>
              <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
                {distributor.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function getDistributorLabel(type: DistributorType): string {
  return DISTRIBUTORS.find((d) => d.id === type)?.label || type;
}
