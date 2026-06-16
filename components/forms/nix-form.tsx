"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface NixFormData {
  repoUrl: string;
  binaryName: string;
}

export const INITIAL_NIX_FORM_DATA: NixFormData = {
  repoUrl: "",
  binaryName: "",
};

interface NixFormProps {
  data: NixFormData;
  onChange: (data: NixFormData) => void;
}

const inputClasses = "h-auto px-4 py-3 rounded-none transition-all";

export function NixForm({ data, onChange }: NixFormProps) {
  const safeData: NixFormData = {
    repoUrl: data.repoUrl ?? "",
    binaryName: data.binaryName ?? "",
  };

  const update = <Key extends keyof NixFormData>(key: Key, value: NixFormData[Key]) => {
    onChange({ ...safeData, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="nix-repo-url" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Repository URL</Label>
          <Input
            id="nix-repo-url"
            placeholder="github.com/user/repo"
            value={safeData.repoUrl}
            disabled
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-foreground)", opacity: 0.7 }}
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="nix-binary-name" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Binary Name</Label>
          <Input
            id="nix-binary-name"
            placeholder="mytool"
            value={safeData.binaryName}
            onChange={(event) => update("binaryName", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <Separator style={{ background: "var(--border)" }} />

      <div className="space-y-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <p>Nix Flake generation produces a <span style={{ color: "var(--foreground)" }}>flake.nix</span> that only supports <span style={{ color: "var(--foreground)" }}>nix profile</span> and <span style={{ color: "var(--foreground)" }}>nix run</span>.</p>
        <p>Other required metadata will be fetched automatically from the prefill URL.</p>
      </div>
    </div>
  );
}
