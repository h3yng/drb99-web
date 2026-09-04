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
import { INITIAL_CURL_FORM_DATA, type CurlFormData } from "@/components/forms/curl-form";
import { prefillFormData } from "@/lib/api";
import { useAppContext, type DistributorType, type PrefillResponse } from "@/lib/app-context";
import { ThemeToggle } from "@/components/theme-toggle";

const WORKFLOW_STEPS = [
    {
        number: "01",
        title: "Repo URL",
        description: "Paste the GitHub repository you want to package.",
    },
    {
        number: "02",
        title: "Targets",
        description: "Choose one or more distributors for the output files.",
    },
    {
        number: "03",
        title: "Generate",
        description: "Open the workspace with your prefilled release data.",
    },
] as const;

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

function buildCurlData(repoUrl: string, prefill: PrefillResponse): CurlFormData {
    const binaryName = prefill.binary_name?.trim() ?? "";
    const assetUrls = toUiAssetUrls(prefill.asset_urls);
    let platforms = Object.keys(assetUrls);

    if (platforms.length === 0 && Array.isArray(prefill.platforms)) {
        platforms = prefill.platforms.map((platform) => toUiPlatform(platform));
    }

    return {
        ...INITIAL_CURL_FORM_DATA,
        repoUrl,
        binaryName,
        version: prefill.version?.trim() ?? "",
        platforms: Array.from(new Set(platforms)),
        assetUrls,
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
        setCurlData,
        prefillRepoUrl,
        setPrefillRepoUrl,
        setPrefillIssue,
    } = useAppContext();

    const [isContinuing, setIsContinuing] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const hasRepoUrl = repoUrl.trim().length > 0;
    const hasTargets = selectedDistributors.size > 0;

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
                setCurlData(buildCurlData(normalizedRepoUrl, prefill));
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
            setCurlData({
                ...INITIAL_CURL_FORM_DATA,
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
                                "Open workspace"
                            )}
                        </Button>
                    </div>
                </div>
            </header>

            <main className="px-4 py-5 sm:px-6">
                <div
                    className="border p-4"
                    style={{
                        borderColor: "var(--border)",
                        background: "var(--surface)",
                        boxShadow: "3px 3px 0px 0px var(--badge-border)",
                    }}
                >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between md:gap-6">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--muted-foreground)" }}>
                                Start here
                            </p>
                            <h2 className="mt-1 text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                                This screen sets up the release workspace.
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                Paste the repository, choose the packaging targets you need, then open the workspace.
                                You can add or remove distributors later without starting over.
                            </p>
                        </div>

                        <div className="grid gap-2 text-xs text-[var(--muted-foreground)] md:min-w-64">
                            <div className="border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                                1. Enter the repo URL
                            </div>
                            <div className="border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                                2. Select at least one target
                            </div>
                            <div className="border px-3 py-2" style={{ borderColor: "var(--border)", background: "var(--background)" }}>
                                3. Open the workspace
                            </div>
                        </div>
                    </div>
                </div>

                <section className="grid gap-3 md:grid-cols-3">
                    {WORKFLOW_STEPS.map((step, index) => {
                        const isComplete = index === 0 ? hasRepoUrl : index === 1 ? hasTargets : isContinuing;
                        const isActive = index === 0 ? !hasRepoUrl : index === 1 ? hasRepoUrl && !hasTargets : hasRepoUrl && hasTargets;

                        return (
                            <div
                                key={step.number}
                                className="border p-4 transition-all duration-150"
                                style={{
                                    borderColor: isComplete || isActive ? "var(--ring)" : "var(--border)",
                                    background: isComplete || isActive ? "var(--surface)" : "var(--card)",
                                    boxShadow: isComplete || isActive ? "3px 3px 0px 0px var(--ring)" : "none",
                                }}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-xs font-semibold uppercase tracking-[0.24em]" style={{ color: "var(--muted-foreground)" }}>
                                        Step {step.number}
                                    </span>
                                    <span
                                        className="h-2.5 w-2.5"
                                        style={{ background: isComplete ? "var(--dot-generated)" : isActive ? "var(--ring)" : "var(--dot-idle)" }}
                                    />
                                </div>
                                <h2 className="mt-3 text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                                    {step.title}
                                </h2>
                                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </section>

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
                        <p className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>
                            {hasTargets ? `${selectedDistributors.size} selected` : "Select one or more targets"}
                        </p>
                    </div>
                    <DistributorSelector selected={selectedDistributors} onChange={toggleDistributor} />
                </section>

                <div
                    className="mt-6 border px-4 py-3 text-sm"
                    style={{
                        borderColor: error ? "var(--error-border)" : "var(--border)",
                        background: error ? "var(--error-bg)" : "var(--surface)",
                        color: error ? "var(--error-text)" : "var(--muted-foreground)",
                    }}
                >
                    {error ? error : "When both fields are ready, Continue will prefill the release data and take you to the result screen."}
                </div>

                {error && (
                    null
                )}
            </main>
        </div>
    );
}
