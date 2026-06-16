"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DistributorSelector } from "@/components/forms/distributor-selector";
import { INITIAL_AUR_FORM_DATA, type AurFormData } from "@/components/forms/aur-form";
import { INITIAL_GO_RELEASE_DATA, type GoReleaseFormData } from "@/components/forms/go-release-form";
import { INITIAL_NPM_WRAPPER_DATA, type NpmWrapperFormData } from "@/components/forms/npm-wrapper-form";
import { INITIAL_NIX_FORM_DATA, type NixFormData } from "@/components/forms/nix-form";
import { INITIAL_DOCKER_FORM_DATA, type DockerFormData } from "@/components/forms/docker-form";
import { prefillFormData } from "@/lib/api";
import { useAppContext, type DistributorType, type PrefillResponse } from "@/lib/app-context";
import { ThemeToggle } from "@/components/theme-toggle";

function toUiPlatform(platform: string): string {
    const value = platform.toLowerCase();

    if (value.includes("linux")) return "linux";
    if (value.includes("darwin") || value.includes("mac")) return "darwin";
    if (value.includes("windows")) return "windows";

    return platform;
}

function toUiAssetUrls(assetUrls: Record<string, string[]> | undefined): Record<string, string[]> {
    if (!assetUrls) {
        return {};
    }

    const result: Record<string, string[]> = {};

    Object.entries(assetUrls).forEach(([platform, urls]) => {
        const uiOs = toUiPlatform(platform);

        // Filter out non-binary files
        const binaryUrls = (Array.isArray(urls) ? urls : [urls]).filter(url => {
            if (typeof url !== "string" || !url.trim()) return false;
            const lowerUrl = url.toLowerCase();
            return !lowerUrl.endsWith('.txt') &&
                !lowerUrl.endsWith('.sha256') &&
                !lowerUrl.endsWith('.sha512') &&
                !lowerUrl.endsWith('.sig') &&
                !lowerUrl.includes('checksum');
        });

        if (binaryUrls.length > 0) {
            if (!result[uiOs]) {
                result[uiOs] = [];
            }
            result[uiOs].push(...binaryUrls);
        }
    });

    return result;
}


function buildNpmData(repoUrl: string, prefill: PrefillResponse): NpmWrapperFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";

    const assetUrls = toUiAssetUrls(prefill.asset_urls);
    let platforms = Object.keys(assetUrls);

    // Fallback if no asset urls but platforms exist
    if (platforms.length === 0 && Array.isArray(prefill.platforms)) {
        platforms = prefill.platforms.map((platform) => toUiPlatform(platform));
    }

    return {
        ...INITIAL_NPM_WRAPPER_DATA,
        repoUrl,
        cliCommandName: binaryName,
        packageName: prefill.package_name?.trim() ?? "",
        license: prefill.license?.trim() || "MIT",
        description: prefill.description?.trim() ?? "",
        version: prefill.version?.trim() ?? "",
        platforms: Array.from(new Set(platforms)),
        assetUrls,
    };
}

function buildGoData(repoUrl: string, prefill: PrefillResponse): GoReleaseFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";
    const platforms = Array.isArray(prefill.platforms)
        ? prefill.platforms.map((platform) => `${toUiPlatform(platform)}-amd64`)
        : [];

    return {
        ...INITIAL_GO_RELEASE_DATA,
        repoUrl,
        binaryName,
        packageName: prefill.package_name?.trim() || binaryName,
        description: prefill.description?.trim() ?? "",
        platforms: Array.from(new Set(platforms)),
    };
}

function buildAurData(repoUrl: string, prefill: PrefillResponse): AurFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";

    return {
        ...INITIAL_AUR_FORM_DATA,
        repoUrl,
        binaryName,
        version: prefill.version?.trim() ?? "",
        license: prefill.license?.trim() || "MIT",
        description: prefill.description?.trim() ?? "",
    };
}

function buildNixData(repoUrl: string, prefill: PrefillResponse): NixFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";

    return {
        repoUrl,
        binaryName,
    };
}

function buildDockerData(repoUrl: string, prefill: PrefillResponse): DockerFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";
    const platforms = Array.isArray(prefill.platforms)
        ? prefill.platforms.map((platform) => toUiPlatform(platform))
        : [];

    return {
        ...INITIAL_DOCKER_FORM_DATA,
        repoUrl,
        binaryName,
        platforms: Array.from(new Set(platforms)),
    };
}

export default function GeneratePage() {
    const router = useRouter();
    const {
        repoUrl,
        setRepoUrl,
        selectedDistributors,
        toggleDistributor,
        setActiveDistributor,
        setNpmWrapperData,
        setGoReleaserData,
        setAurData,
        setNixData,
        setDockerData,
        prefillRepoUrl,
        setPrefillRepoUrl,
        setPrefillIssue,
    } = useAppContext();

    const [isContinuing, setIsContinuing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleContinue = async () => {
        const normalizedRepoUrl = repoUrl.trim();

        if (!normalizedRepoUrl) {
            setError("Repository URL is required.");
            return;
        }

        if (selectedDistributors.size === 0) {
            setError("Select at least one distributor.");
            return;
        }

        setError(null);
        setIsContinuing(true);

        try {
            setRepoUrl(normalizedRepoUrl);

            if (prefillRepoUrl !== normalizedRepoUrl) {
                const prefill = (await prefillFormData(normalizedRepoUrl)) as PrefillResponse;

                setNpmWrapperData(buildNpmData(normalizedRepoUrl, prefill));
                setGoReleaserData(buildGoData(normalizedRepoUrl, prefill));
                setAurData(buildAurData(normalizedRepoUrl, prefill));
                setNixData(buildNixData(normalizedRepoUrl, prefill));
                setDockerData(buildDockerData(normalizedRepoUrl, prefill));
                setPrefillRepoUrl(normalizedRepoUrl);
                setPrefillIssue(null);
            }

            const firstDistributor = Array.from(selectedDistributors)[0] ?? null;
            setActiveDistributor(firstDistributor as DistributorType | null);
            router.push("/result");
        } catch (prefillError) {
            setPrefillIssue(prefillError instanceof Error ? prefillError.message : "Prefill failed");

            setNpmWrapperData({
                ...INITIAL_NPM_WRAPPER_DATA,
                repoUrl: normalizedRepoUrl,
            });
            setGoReleaserData({
                ...INITIAL_GO_RELEASE_DATA,
                repoUrl: normalizedRepoUrl,
            });
            setAurData({
                ...INITIAL_AUR_FORM_DATA,
                repoUrl: normalizedRepoUrl,
            });
            setNixData({
                ...INITIAL_NIX_FORM_DATA,
                repoUrl: normalizedRepoUrl,
            });
            setDockerData({
                ...INITIAL_DOCKER_FORM_DATA,
                repoUrl: normalizedRepoUrl,
            });
            setPrefillRepoUrl(null);

            const firstDistributor = Array.from(selectedDistributors)[0] ?? null;
            setActiveDistributor(firstDistributor as DistributorType | null);
            router.push("/result");
        } finally {
            setIsContinuing(false);
        }
    };

    return (
        <div className="min-h-screen text-[var(--foreground)]" style={{ background: "var(--background)" }}>
            <header className="px-4 py-4 sm:px-6" style={{ borderBottom: "1px solid var(--header-border)" }}>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2"
                            style={{ color: "var(--btn-ghost-text)" }}
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                        <h1 className="text-lg font-medium tracking-wide">DRB99</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Button
                            onClick={handleContinue}
                            disabled={Boolean(isContinuing || selectedDistributors.size === 0)}
                            className="h-9 px-5 transition-all duration-150 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0"
                            style={{
                                background: "var(--btn-primary-bg)",
                                color: "var(--btn-primary-text)",
                                border: "1px solid var(--btn-primary-bg)",
                                boxShadow: `3px 3px 0px 0px var(--btn-primary-shadow)`,
                            }}
                        >
                            {isContinuing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Prefilling...
                                </>
                            ) : (
                                "Continue"
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-5 sm:px-6">
                <Card className="rounded-none" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Repository URL</CardTitle>
                        <CardDescription style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>This URL is used for prefill and generation context.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Label htmlFor="repo-url" className="sr-only">
                            Repository URL
                        </Label>
                        <Input
                            id="repo-url"
                            placeholder="https://github.com/owner/repo"
                            value={repoUrl}
                            onChange={(event) => {
                                setRepoUrl(event.target.value);
                                setError(null);
                            }}
                            className="h-11 rounded-none focus:ring-0"
                            style={{
                                border: "1px solid var(--input)",
                                background: "var(--surface)",
                                color: "var(--foreground)",
                            }}
                        />
                    </CardContent>
                </Card>

                <section className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>Distributors</h2>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>Select one or more targets</p>
                    </div>
                    <DistributorSelector selected={selectedDistributors} onChange={toggleDistributor} />
                </section>

                {error && (
                    <div className="mt-5 px-4 py-3 text-sm" style={{ border: "1px solid var(--error-border)", background: "var(--error-bg)", color: "var(--error-text)" }}>
                        {error}
                    </div>
                )}
            </main>
        </div>
    );
}
