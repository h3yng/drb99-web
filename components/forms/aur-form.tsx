"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export interface AurFormData {
  repoUrl: string;
  binaryName: string;
  version: string;
  license: string;
  description: string;
}

export const INITIAL_AUR_FORM_DATA: AurFormData = {
  repoUrl: "",
  binaryName: "",
  version: "",
  license: "MIT",
  description: "",
};

interface AurFormProps {
  data: AurFormData;
  onChange: (data: AurFormData) => void;
}

const inputClasses = "h-auto px-4 py-3 rounded-none transition-all";

export function AurForm({ data, onChange }: AurFormProps) {
  const safeData: AurFormData = {
    repoUrl: data.repoUrl ?? "",
    binaryName: data.binaryName ?? "",
    version: data.version ?? "",
    license: data.license ?? "MIT",
    description: data.description ?? "",
  };

  const update = <Key extends keyof AurFormData>(key: Key, value: AurFormData[Key]) => {
    onChange({ ...safeData, [key]: value });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="aur-repo-url" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Repository URL</Label>
          <Input
            id="aur-repo-url"
            placeholder="github.com/user/repo"
            value={safeData.repoUrl}
            onChange={(event) => update("repoUrl", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="aur-binary-name" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Binary Name</Label>
          <Input
            id="aur-binary-name"
            placeholder="mytool"
            value={safeData.binaryName}
            onChange={(event) => update("binaryName", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="aur-version" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Version</Label>
          <Input
            id="aur-version"
            placeholder="v1.0.0"
            value={safeData.version}
            onChange={(event) => update("version", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="aur-license" className="text-sm" style={{ color: "var(--muted-foreground)" }}>License</Label>
          <Input
            id="aur-license"
            placeholder="MIT"
            value={safeData.license}
            onChange={(event) => update("license", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <div className="space-y-2.5">
        <Label htmlFor="aur-description" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Description</Label>
        <textarea
          id="aur-description"
          placeholder="AUR package for mytool"
          value={safeData.description}
          onChange={(event) => update("description", event.target.value)}
          rows={6}
          className="w-full rounded-none border px-4 py-3 text-sm transition-all resize-y focus:outline-none focus:ring-1"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--foreground)",
          }}
        />
      </div>

      <Separator style={{ background: "var(--border)" }} />

      <div className="space-y-2 text-xs" style={{ color: "var(--muted-foreground)" }}>
        <p>AUR generation produces <span style={{ color: "var(--foreground)" }}>PKGBUILD</span> and <span style={{ color: "var(--foreground)" }}>.github/workflows/aur.yaml</span>.</p>
        <p>Version is required because the package template is versioned off the repository tag.</p>
      </div>
    </div>
  );
}
