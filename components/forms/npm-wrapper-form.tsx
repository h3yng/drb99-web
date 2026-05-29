"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PLATFORM_OPTIONS, type PlatformId } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export interface NpmWrapperFormData {
    repoUrl: string;
    cliCommandName: string;
    packageName: string;
    license: string;
    description: string;
    version: string;
    platforms: string[];
    assetUrls: Record<string, string[]>;
}

export const INITIAL_NPM_WRAPPER_DATA: NpmWrapperFormData = {
    repoUrl: "",
    cliCommandName: "",
    packageName: "",
    license: "MIT",
    description: "",
    version: "",
    platforms: [],
    assetUrls: {},
};

interface NpmWrapperFormProps {
    data: NpmWrapperFormData;
    onChange: (data: NpmWrapperFormData) => void;
}

const inputClasses = "py-3 px-4 h-auto rounded-none transition-all";

export function NpmWrapperForm({ data, onChange }: NpmWrapperFormProps) {
    const safeData: NpmWrapperFormData = {
        repoUrl: data.repoUrl ?? "",
        cliCommandName: data.cliCommandName ?? "",
        packageName: data.packageName ?? "",
        license: data.license ?? "MIT",
        description: data.description ?? "",
        version: data.version ?? "",
        platforms: data.platforms ?? [],
        assetUrls: data.assetUrls ?? {},
    };

    const update = <Key extends keyof NpmWrapperFormData>(
        key: Key,
        value: NpmWrapperFormData[Key]
    ) => {
        onChange({ ...safeData, [key]: value });
    };

    const updateCommandName = (cliCommandName: string) => {
        onChange({
            ...safeData,
            cliCommandName,
            description:
                safeData.description?.trim()
                    ? safeData.description
                    : `npm wrapper for ${cliCommandName}`,
        });
    };

    const togglePlatform = (platformId: PlatformId, checked: boolean) => {
        const platforms = checked
            ? [...new Set([...safeData.platforms, platformId])]
            : safeData.platforms.filter((p) => p !== platformId);

        const assetUrls = { ...safeData.assetUrls };

        // Only add empty entry for newly selected platforms that have no stored URLs
        if (checked && !(platformId in assetUrls)) {
            assetUrls[platformId] = [""];
        }

        // Keep URLs in state when unchecked — they come back if re-selected

        onChange({ ...safeData, platforms, assetUrls });
    };

    const updateAssetUrl = (platformId: string, index: number, url: string) => {
        const currentUrls = [...(safeData.assetUrls[platformId] ?? [""])];
        currentUrls[index] = url;
        update("assetUrls", { ...safeData.assetUrls, [platformId]: currentUrls });
    };

    const addAssetUrl = (platformId: string) => {
        const currentUrls = [...(safeData.assetUrls[platformId] ?? [])];
        currentUrls.push("");
        update("assetUrls", { ...safeData.assetUrls, [platformId]: currentUrls });
    };

    const removeAssetUrl = (platformId: string, index: number) => {
        const currentUrls = [...(safeData.assetUrls[platformId] ?? [])];
        currentUrls.splice(index, 1);
        if (currentUrls.length === 0) currentUrls.push("");
        update("assetUrls", { ...safeData.assetUrls, [platformId]: currentUrls });
    };

    const selectedPlatforms = PLATFORM_OPTIONS.filter((platform) =>
        safeData.platforms.includes(platform.id)
    );

    return (
        <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-3">
                <div className="space-y-2.5">
                    <Label htmlFor="npm-repo-url" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Repository URL</Label>
                    <Input
                        id="npm-repo-url"
                        placeholder="github.com/user/repo"
                        value={safeData.repoUrl}
                        onChange={(event) => update("repoUrl", event.target.value)}
                        className={inputClasses}
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label htmlFor="npm-cli-command" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Binary Name</Label>
                    <Input
                        id="npm-cli-command"
                        placeholder="mytool"
                        value={safeData.cliCommandName}
                        onChange={(event) => updateCommandName(event.target.value)}
                        className={inputClasses}
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label htmlFor="npm-version" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Version</Label>
                    <Input
                        id="npm-version"
                        placeholder="1.0.0"
                        value={safeData.version}
                        onChange={(event) => update("version", event.target.value)}
                        className={inputClasses}
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2.5">
                    <Label htmlFor="npm-package-name" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Package Name</Label>
                    <Input
                        id="npm-package-name"
                        placeholder="mytool-cli"
                        value={safeData.packageName}
                        onChange={(event) => update("packageName", event.target.value)}
                        className={inputClasses}
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="space-y-2.5">
                    <Label htmlFor="npm-license" className="text-sm" style={{ color: "var(--muted-foreground)" }}>License (optional)</Label>
                    <Input
                        id="npm-license"
                        placeholder="MIT"
                        value={safeData.license}
                        onChange={(event) => update("license", event.target.value)}
                        className={inputClasses}
                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    />
                </div>
            </div>

            <div className="space-y-2.5">
                <Label htmlFor="npm-description" className="text-sm" style={{ color: "var(--muted-foreground)" }}>Description (optional)</Label>
                <textarea
                    id="npm-description"
                    placeholder={
                        safeData.cliCommandName.trim()
                            ? `npm wrapper for ${safeData.cliCommandName}`
                            : "npm wrapper for <binary_name>"
                    }
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

            <div className="space-y-6">
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

                {selectedPlatforms.length > 0 && (
                    <div className="space-y-4 py-2">
                        <Label className="text-sm" style={{ color: "var(--muted-foreground)" }}>Platform Asset URLs</Label>
                        <div className="space-y-5">
                            {selectedPlatforms.map((platform) => {
                                const urls = safeData.assetUrls[platform.id] ?? [""];

                                return (
                                    <div key={platform.id} className="space-y-2.5">
                                        <Label className="text-xs uppercase tracking-wide" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
                                            {platform.label}
                                        </Label>
                                        <div className="space-y-2">
                                            {urls.map((url, index) => (
                                                <div key={index} className="flex items-center gap-2">
                                                    <Input
                                                        placeholder={`https://.../${platform.id}-binary`}
                                                        value={url}
                                                        onChange={(event) =>
                                                            updateAssetUrl(platform.id, index, event.target.value)
                                                        }
                                                        className="py-2.5 px-4 h-auto rounded-none transition-all flex-1"
                                                        style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--foreground)" }}
                                                    />
                                                    {urls.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAssetUrl(platform.id, index)}
                                                            className="shrink-0 flex items-center justify-center w-8 h-8 border transition-colors hover:text-red-500"
                                                            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                                                            title="Remove URL"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => addAssetUrl(platform.id)}
                                                className="flex items-center gap-1.5 text-xs transition-colors mt-1"
                                                style={{ color: "var(--muted-foreground)" }}
                                            >
                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                                </svg>
                                                Add URL
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
