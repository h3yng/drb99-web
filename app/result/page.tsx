"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Editor, type OnMount } from "@monaco-editor/react";
import { ArrowLeft, Check, Copy, DownloadCloud, FileCode2, Lock, Pencil } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { AurForm } from "@/components/forms/aur-form";
import { GoReleaseForm } from "@/components/forms/go-release-form";
import { NpmWrapperForm } from "@/components/forms/npm-wrapper-form";
import { NixForm } from "@/components/forms/nix-form";
import { DockerForm } from "@/components/forms/docker-form";
import { generatePackage } from "@/lib/api";
import { useAppContext, type DistributorType } from "@/lib/app-context";
import { getDistributorLabel } from "@/components/forms/distributor-selector";
import { mapPlatform, mapPlatformsList } from "@/lib/platforms";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTheme } from "@/components/theme-provider";

interface GeneratedResult {
  files: Record<string, string>;
  summary: Record<string, unknown>;
}

interface DistributorViewState {
  result: GeneratedResult | null;
  activeFile: string;
  editedContents: Record<string, string>;
  isEditing: boolean;
}

type ViewStateMap = Partial<Record<DistributorType, DistributorViewState>>;

function getLanguage(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "json":
      return "json";
    case "js":
    case "ts":
      return "javascript";
    case "md":
      return "markdown";
    case "yml":
    case "yaml":
      return "yaml";
    case "nix":
      return "nix";
    default:
      return "plaintext";
  }
}

function getDistributorIcon(type: DistributorType): string {
  switch (type) {
    case "npm_wrapper":
      return "/icons/npm-wrapper.svg";
    case "goreleaser":
      return "/icons/go-releaser.svg";
    case "aur":
      return "/icons/aur.svg";
    case "nix":
      return "/icons/nix.svg";
    case "docker":
      return "/icons/docker.svg";
    default:
      return "";
  }
}

function createDefaultViewState(): DistributorViewState {
  return {
    result: null,
    activeFile: "",
    editedContents: {},
    isEditing: false,
  };
}

function isDistributorType(value: string | null): value is DistributorType {
  return value === "npm_wrapper" || value === "goreleaser" || value === "github_actions" || value === "aur" || value === "nix" || value === "docker";
}

function getCurrentFileContent(viewState: DistributorViewState, filename: string) {
  if (!viewState.result || !filename) {
    return "";
  }

  return viewState.editedContents[filename] ?? viewState.result.files[filename] ?? "";
}

function ResultPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const {
    repoUrl,
    selectedDistributors,
    aurData,
    setAurData,
    npmWrapperData,
    setNpmWrapperData,
    goReleaserData,
    setGoReleaserData,
    nixData,
    setNixData,
    dockerData,
    setDockerData,
    prefillIssue,
  } = useAppContext();

  const distributors = useMemo(
    () => Array.from(selectedDistributors),
    [selectedDistributors]
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewStates, setViewStates] = useState<ViewStateMap>({});

  useEffect(() => {
    if (!repoUrl || distributors.length === 0) {
      router.replace("/generate");
    }
  }, [repoUrl, distributors, router]);

  const drbParam = searchParams.get("drb");
  const firstDistributor = distributors[0] ?? null;
  const activeDistributor: DistributorType | null = isDistributorType(drbParam) && distributors.includes(drbParam)
    ? drbParam
    : firstDistributor;

  useEffect(() => {
    if (!activeDistributor) return;

    if (drbParam !== activeDistributor) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("drb", activeDistributor);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [activeDistributor, drbParam, pathname, router, searchParams]);

  useEffect(() => {
    if (!editorRef.current) return;

    const layoutEditor = () => editorRef.current?.layout();
    const frame = requestAnimationFrame(layoutEditor);
    window.addEventListener("resize", layoutEditor);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", layoutEditor);
    };
  }, [activeDistributor, viewStates]);

  const currentViewState = activeDistributor
    ? viewStates[activeDistributor] ?? createDefaultViewState()
    : createDefaultViewState();

  const handleSidebarSelect = (distributor: DistributorType) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("drb", distributor);
    router.push(`${pathname}?${params.toString()}`);
  };

  const setCurrentViewState = (updater: (prev: DistributorViewState) => DistributorViewState) => {
    if (!activeDistributor) return;

    setViewStates((prev) => {
      const current = prev[activeDistributor] ?? createDefaultViewState();
      return {
        ...prev,
        [activeDistributor]: updater(current),
      };
    });
  };

  const handleGenerateCurrent = async () => {
    if (!activeDistributor) return;

    try {
      setIsGenerating(true);
      setError(null);

      const features = {
        npm_wrapper: activeDistributor === "npm_wrapper",
        goreleaser: activeDistributor === "goreleaser",
        github_actions:
          activeDistributor === "github_actions" ||
          activeDistributor === "goreleaser",
        aur: activeDistributor === "aur",
        nix_flake: activeDistributor === "nix",
        docker_container: activeDistributor === "docker",
      };

      const payload: Record<string, unknown> = {
        repo_url: repoUrl,
        features,
      };

      if (activeDistributor === "npm_wrapper") {
        // Map form platform IDs (linux/darwin/windows) to API format (linux-amd64/darwin-arm64/windows-amd64)
        const assetUrls: Record<string, string[]> = {};
        for (const platform of npmWrapperData.platforms) {
          const urls = (npmWrapperData.assetUrls[platform] || []).filter(u => u.trim() !== "");
          if (urls.length > 0) {
            assetUrls[mapPlatform(platform)] = urls;
          }
        }

        Object.assign(payload, {
          binary_name: npmWrapperData.cliCommandName,
          package_name: npmWrapperData.packageName,
          license: npmWrapperData.license || "MIT",
          description: npmWrapperData.description,
          version: npmWrapperData.version,
          platforms: mapPlatformsList(npmWrapperData.platforms),
          mode: "manual",
          asset_urls: assetUrls,
        });
      }

      if (activeDistributor === "goreleaser") {
        Object.assign(payload, {
          binary_name: goReleaserData.binaryName,
          platforms: mapPlatformsList(goReleaserData.platforms),
        });
      }

      if (activeDistributor === "github_actions") {
        Object.assign(payload, {
          binary_name: npmWrapperData.cliCommandName || goReleaserData.binaryName,
          platforms: mapPlatformsList(
            npmWrapperData.platforms.length > 0 ? npmWrapperData.platforms : goReleaserData.platforms
          ),
        });
      }

      if (activeDistributor === "aur") {
        Object.assign(payload, {
          binary_name: aurData.binaryName,
          version: aurData.version,
          license: aurData.license || "MIT",
          description: aurData.description,
        });
      }

      if (activeDistributor === "nix") {
        Object.assign(payload, {
          binary_name: nixData.binaryName,
        });
      }

      if (activeDistributor === "docker") {
        Object.assign(payload, {
          binary_name: dockerData.binaryName,
          runtime_image: dockerData.runtimeImage,
          platforms: mapPlatformsList(dockerData.platforms),
        });
      }

      const result = await generatePackage(payload);
      const generated = {
        files: result.files as Record<string, string>,
        summary: payload,
      };
      const firstFile = Object.keys(generated.files)[0] ?? "";

      setCurrentViewState(() => ({
        result: generated,
        activeFile: firstFile,
        editedContents: {},
        isEditing: false,
      }));
    } catch (generateError) {
      setError(generateError instanceof Error ? generateError.message : "Failed to generate package");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleEditing = () => {
    setCurrentViewState((prev) => ({
      ...prev,
      isEditing: !prev.isEditing,
    }));
  };

  const handleSelectFile = (filename: string) => {
    setCurrentViewState((prev) => ({
      ...prev,
      activeFile: filename,
    }));
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!activeDistributor || !currentViewState.activeFile || value === undefined) return;

    setCurrentViewState((prev) => ({
      ...prev,
      editedContents: {
        ...prev.editedContents,
        [prev.activeFile]: value,
      },
    }));
  };

  const handleCopy = () => {
    if (!currentViewState.activeFile) return;

    const content = getCurrentFileContent(currentViewState, currentViewState.activeFile);
    if (!content) return;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownloadZip = async () => {
    if (!currentViewState.result) return;

    const zip = new JSZip();

    Object.keys(currentViewState.result.files).forEach((filename) => {
      zip.file(filename, getCurrentFileContent(currentViewState, filename));
    });

    const binaryName = (currentViewState.result.summary?.binary_name as string) || "generated-package";
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `${binaryName}-${activeDistributor}.zip`);
  };

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.layout();
  };

  const renderForm = () => {
    if (!activeDistributor) return null;

    if (activeDistributor === "npm_wrapper") {
      return <NpmWrapperForm data={npmWrapperData} onChange={setNpmWrapperData} />;
    }

    if (activeDistributor === "goreleaser") {
      return <GoReleaseForm data={goReleaserData} onChange={setGoReleaserData} />;
    }

    if (activeDistributor === "aur") {
      return <AurForm data={aurData} onChange={setAurData} />;
    }

    if (activeDistributor === "nix") {
      return <NixForm data={nixData} onChange={setNixData} />;
    }

    if (activeDistributor === "docker") {
      return <DockerForm data={dockerData} onChange={setDockerData} />;
    }

    return (
      <div className="p-4 text-sm" style={{ border: "1px solid var(--border)", background: "var(--surface)", color: "var(--muted-foreground)" }}>
        GitHub Actions generator has no extra form fields. Use Generate to create workflow files.
      </div>
    );
  };

  if (!repoUrl || distributors.length === 0 || !activeDistributor) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)" }}>
        <p style={{ color: "var(--muted-foreground)" }}>Loading...</p>
      </div>
    );
  }

  const hasResult = Boolean(currentViewState.result);
  const fileList = hasResult ? Object.keys(currentViewState.result!.files) : [];
  const selectedFile = currentViewState.activeFile || fileList[0] || "";

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
      <aside className="w-64 shrink-0" style={{ borderRight: "1px solid var(--border)", background: "var(--sidebar-bg)" }}>
        <div className="flex h-12 items-center px-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/generate")}
            className="h-8 px-2"
            style={{ color: "var(--btn-ghost-text)" }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>

        <nav>
          {distributors.map((distributor) => {
            const isActive = activeDistributor === distributor;
            const generated = Boolean(viewStates[distributor]?.result);

            return (
              <button
                key={distributor}
                onClick={() => handleSidebarSelect(distributor)}
                className="sidebar-nav-item flex h-14 w-full items-center justify-between px-4 text-left text-sm cursor-pointer transition-all duration-150"
                style={{
                  borderBottom: "1px solid var(--border)",
                  background: isActive ? "var(--sidebar-active)" : "transparent",
                  color: isActive ? "var(--foreground)" : "var(--muted-foreground)",
                }}
              >
                <div className="flex items-center gap-3">
                  {getDistributorIcon(distributor) && (
                    <img
                      src={getDistributorIcon(distributor)}
                      alt={getDistributorLabel(distributor)}
                      className="h-5 w-5 object-contain opacity-80"
                    />
                  )}
                  <span>{getDistributorLabel(distributor)}</span>
                </div>
                <span className="h-1.5 w-1.5" style={{ background: generated ? "var(--dot-generated)" : "var(--dot-idle)" }} />
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-medium uppercase tracking-wide" style={{ color: "var(--muted-foreground)" }}>
                {getDistributorLabel(activeDistributor)}
              </h1>
              <p className="text-xs" style={{ color: "var(--muted-foreground)", opacity: 0.7 }}>{repoUrl}</p>
            </div>

            <div className="flex items-center gap-2">
              {hasResult && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-2"
                    style={{ border: "1px solid var(--input)", color: "var(--muted-foreground)" }}
                  >
                    {copied ? <Check className="h-4 w-4" style={{ color: "var(--dot-generated)" }} /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleEditing}
                    className="h-8 gap-2"
                    style={{ border: "1px solid var(--input)", color: "var(--muted-foreground)" }}
                  >
                    {currentViewState.isEditing ? <Pencil className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {currentViewState.isEditing ? "Editing" : "Read only"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadZip}
                    className="h-8 gap-2"
                    style={{ border: "1px solid var(--input)", color: "var(--muted-foreground)" }}
                  >
                    <DownloadCloud className="h-4 w-4" />
                    Download
                  </Button>
                </>
              )}

              <ThemeToggle />

              {!hasResult && (
                <Button
                  onClick={handleGenerateCurrent}
                  disabled={isGenerating}
                  className="h-9 px-5 transition-all duration-150 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-40 disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0"
                  style={{
                    background: "var(--btn-primary-bg)",
                    color: "var(--btn-primary-text)",
                    border: "1px solid var(--btn-primary-bg)",
                    boxShadow: "3px 3px 0px 0px var(--btn-primary-shadow)",
                  }}
                >
                  {isGenerating ? "Generating..." : "Generate"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {prefillIssue && (
          <div className="px-5 py-2 text-xs" style={{ borderBottom: "1px solid var(--warning-border)", background: "var(--warning-bg)", color: "var(--warning-text)" }}>
            Prefill notice: {prefillIssue}
          </div>
        )}

        {error && (
          <div className="px-5 py-2 text-xs" style={{ borderBottom: "1px solid var(--error-border)", background: "var(--error-bg)", color: "var(--error-text)" }}>{error}</div>
        )}

        <section className="flex min-h-0 flex-1">
          {!hasResult ? (
            <div className="w-full overflow-auto p-5">{renderForm()}</div>
          ) : (
            <>
              <div className="w-64 shrink-0" style={{ borderRight: "1px solid var(--border)" }}>
                <div className="px-4 py-2 text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border)", color: "var(--muted-foreground)" }}>
                  Files
                </div>
                <div>
                  {fileList.map((filename) => (
                    <button
                      key={filename}
                      onClick={() => handleSelectFile(filename)}
                      className="sidebar-nav-item flex h-10 w-full items-center gap-2 px-3 text-left text-sm cursor-pointer transition-all duration-150"
                      style={{
                        borderBottom: "1px solid var(--border)",
                        background: selectedFile === filename ? "var(--sidebar-active)" : "transparent",
                        color: selectedFile === filename ? "var(--foreground)" : "var(--muted-foreground)",
                      }}
                    >
                      <FileCode2 className="h-4 w-4" />
                      <span className="truncate">{filename}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0 flex-1">
                <ThemedEditor
                  selectedFile={selectedFile}
                  currentViewState={currentViewState}
                  handleEditorMount={handleEditorMount}
                  handleEditorChange={currentViewState.isEditing ? handleEditorChange : undefined}
                />
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function ThemedEditor({
  selectedFile,
  currentViewState,
  handleEditorMount,
  handleEditorChange,
}: {
  selectedFile: string;
  currentViewState: DistributorViewState;
  handleEditorMount: OnMount;
  handleEditorChange: ((value: string | undefined) => void) | undefined;
}) {
  const { theme } = useTheme();

  return (
    <Editor
      height="100%"
      language={getLanguage(selectedFile)}
      theme={theme === "dark" ? "vs-dark" : "light"}
      value={getCurrentFileContent(currentViewState, selectedFile)}
      onMount={handleEditorMount}
      onChange={handleEditorChange}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        readOnly: !currentViewState.isEditing,
        fontSize: 13,
      }}
    />
  );
}

export default function ResultPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "var(--background)", color: "var(--muted-foreground)" }}>
          Loading result view...
        </div>
      }
    >
      <ResultPageContent />
    </React.Suspense>
  );
}
