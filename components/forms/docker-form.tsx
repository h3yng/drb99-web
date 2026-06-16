"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PLATFORM_OPTIONS, type PlatformId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export interface DockerFormData {
  repoUrl: string;
  binaryName: string;
  runtimeImage: string;
  platforms: string[];
}

interface DockerFormProps {
  data: DockerFormData;
  onChange: (data: DockerFormData) => void;
}

const inputClasses = "py-3 px-4 h-auto rounded-none transition-all";

export function DockerForm({ data, onChange }: DockerFormProps) {
  const safeData: DockerFormData = {
    repoUrl: data.repoUrl ?? "",
    binaryName: data.binaryName ?? "",
    runtimeImage: data.runtimeImage ?? "golang:latest",
    platforms: data.platforms ?? [],
  };

  const update = <Key extends keyof DockerFormData>(
    key: Key,
    value: DockerFormData[Key]
  ) => {
    onChange({ ...safeData, [key]: value });
  };

  const togglePlatform = (platformId: PlatformId, checked: boolean) => {
    const platforms = checked
      ? [...new Set([...safeData.platforms, platformId])]
      : safeData.platforms.filter((platform) => platform !== platformId);

    update("platforms", platforms);
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="docker-repo-url" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Repository URL</Label>
          <Input
            id="docker-repo-url"
            placeholder="github.com/user/repo"
            value={safeData.repoUrl}
            disabled
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--muted-foreground)", opacity: 0.7 }}
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="docker-binary-name" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Binary Name</Label>
          <Input
            id="docker-binary-name"
            placeholder="drb99"
            value={safeData.binaryName}
            onChange={(event) => update("binaryName", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2.5">
          <Label htmlFor="docker-runtime-image" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Runtime Image</Label>
          <Input
            id="docker-runtime-image"
            placeholder="golang:latest"
            value={safeData.runtimeImage}
            onChange={(event) => update("runtimeImage", event.target.value)}
            className={inputClasses}
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
          />
        </div>
      </div>

      <Separator style={{ background: "var(--border)" }} />

      <div className="space-y-3">
        <Label className="text-sm" style={{ color: "var(--muted-foreground)" }}>Target Platforms</Label>
        <div className="grid grid-cols-3 gap-4">
          {PLATFORM_OPTIONS.map((platform) => {
            const isChecked = safeData.platforms.includes(platform.id);

            return (
              <div
                key={platform.id}
                role="button"
                tabIndex={0}
                onClick={() => togglePlatform(platform.id, !isChecked)}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    togglePlatform(platform.id, !isChecked);
                  }
                }}
                className="group flex cursor-pointer flex-col items-center justify-center rounded-none border p-4 transition-all outline-none focus-visible:ring-2"
                style={{
                  borderColor: isChecked ? "var(--ring)" : "var(--border)",
                  background: isChecked ? "var(--accent)" : "transparent",
                }}
              >
                {platform.id === "linux" && <img src="https://files.svgcdn.io/flat-color-icons/linux.svg" alt="Linux" className={cn("w-7 h-7 mb-3 transition-all", isChecked ? "opacity-100 drop-shadow-sm" : "opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0")} />}
                {platform.id === "darwin" && <img src="https://files.svgcdn.io/qlementine-icons/mac-16.svg" alt="macOS" className={cn("platform-icon-mac w-7 h-7 mb-3 transition-all", isChecked ? "opacity-100 drop-shadow-sm" : "opacity-50 grayscale group-hover:opacity-80")} />}
                {platform.id === "windows" && <img src="https://files.svgcdn.io/devicon/windows8.svg" alt="Windows" className={cn("w-7 h-7 mb-3 transition-all", isChecked ? "opacity-100 drop-shadow-sm" : "opacity-50 grayscale group-hover:opacity-80 group-hover:grayscale-0")} />}
                <span className="text-xs font-medium transition-colors" style={{ color: isChecked ? "var(--foreground)" : "var(--muted-foreground)" }}>{platform.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export const INITIAL_DOCKER_FORM_DATA: DockerFormData = {
  repoUrl: "",
  binaryName: "",
  runtimeImage: "golang:latest",
  platforms: [],
};
