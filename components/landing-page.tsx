"use client";

import * as React from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

// Self-contained inline SVG Icon components
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5 5 3Z" />
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5Z" />
  </svg>
);

interface FloatingIcon {
  src: string;
  alt: string;
  size: number;
  initialLeft: string;
  initialTop: string;
  duration: string;
  delay: string;
  rotateDirection: number; // 1 or -1
}

const FLOATING_ICONS: FloatingIcon[] = [
  // Clustered closer to the center to float behind/around the hero content (Single instance of each)
  { src: "/icons/npm-wrapper.svg", alt: "NPM Wrapper", size: 85, initialLeft: "20%", initialTop: "24%", duration: "24s", delay: "0s", rotateDirection: 1 },
  { src: "/icons/go-releaser.svg", alt: "GoReleaser", size: 95, initialLeft: "70%", initialTop: "20%", duration: "28s", delay: "-3s", rotateDirection: -1 },
  { src: "/icons/aur.svg", alt: "AUR", size: 75, initialLeft: "24%", initialTop: "56%", duration: "32s", delay: "-6s", rotateDirection: 1 },
  { src: "/icons/nix.svg", alt: "Nix Flake", size: 90, initialLeft: "68%", initialTop: "52%", duration: "26s", delay: "-9s", rotateDirection: -1 },
  { src: "/icons/docker.svg", alt: "Docker", size: 80, initialLeft: "46%", initialTop: "70%", duration: "30s", delay: "-12s", rotateDirection: 1 },
];

const TARGETS = [
  {
    label: "NPM Wrapper",
    description: "Package a Go binary for npm users without hand-rolling release wiring.",
    icon: "/icons/npm-wrapper.svg",
  },
  {
    label: "GoReleaser",
    description: "Generate release config that stays aligned with your build matrix.",
    icon: "/icons/go-releaser.svg",
  },
  {
    label: "AUR",
    description: "Produce Arch packaging files with less repetitive setup.",
    icon: "/icons/aur.svg",
  },
  {
    label: "Nix Flake",
    description: "Create a reproducible Nix target from the same source inputs.",
    icon: "/icons/nix.svg",
  },
  {
    label: "Docker",
    description: "Ship container-friendly output when the binary needs a runtime image.",
    icon: "/icons/docker.svg",
  },
] as const;

const FEATURE_PILLS = ["One repo URL", "Multiple release targets", "Theme-aware output", "Fast prefill"] as const;

export function LandingPage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-5 font-sans sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-30" style={{ background: "var(--background)" }} />
      <div
        className="absolute inset-0 -z-20 opacity-60 dark:opacity-100"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(255, 255, 255, 0.8), transparent 24%), radial-gradient(circle at 85% 15%, rgba(0, 172, 215, 0.18), transparent 30%), radial-gradient(circle at 20% 80%, rgba(0, 0, 0, 0.08), transparent 28%)",
        }}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes float-drift-1 {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(-25px) translateX(12px) rotate(5deg); }
            66% { transform: translateY(15px) translateX(-10px) rotate(-3deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
          @keyframes float-drift-2 {
            0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
            33% { transform: translateY(20px) translateX(-15px) rotate(-6deg); }
            66% { transform: translateY(-18px) translateX(15px) rotate(4deg); }
            100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
          }
          .icon-float-1 { animation: float-drift-1 linear infinite; }
          .icon-float-2 { animation: float-drift-2 linear infinite; }
        `,
        }}
      />

      <div
        className="absolute inset-0 -z-20 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(var(--foreground) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none absolute inset-0 -z-10 select-none overflow-hidden">
        {FLOATING_ICONS.map((icon, idx) => (
          <div
            key={idx}
            className={`absolute transition-opacity duration-500 ${idx % 2 === 0 ? "icon-float-1" : "icon-float-2"}`}
            style={{
              left: icon.initialLeft,
              top: icon.initialTop,
              animationDuration: icon.duration,
              animationDelay: icon.delay,
              opacity: "var(--floating-icon-opacity, 0.12)",
            }}
          >
            <img
              src={icon.src}
              alt={icon.alt}
              style={{
                width: `${icon.size}px`,
                height: `${icon.size}px`,
                filter: "grayscale(20%) brightness(0.9)",
              }}
              className="object-contain"
            />
          </div>
        ))}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
          :root {
            --floating-icon-opacity: 0.12;
          }
          .dark {
            --floating-icon-opacity: 0.20;
          }
        `,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col">
        <header className="flex items-center justify-between py-2 sm:py-4">
          <div className="flex items-center gap-3">
            <img src="/logo/drb99-logo.png" alt="drb99" className="h-10 w-10 rounded-none object-contain" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--muted-foreground)" }}>
                drb99
              </p>
              <p className="text-sm" style={{ color: "var(--foreground)" }}>
                Ship Go releases without the packaging tax
              </p>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <main className="grid flex-1 items-center gap-10 py-8 lg:grid-cols-[1.05fr_.95fr] lg:py-12">
          <section className="relative max-w-3xl">
            <div
              className="mb-6 inline-flex items-center gap-2 border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] backdrop-blur-md"
              style={{
                borderColor: "var(--badge-border)",
                background: "var(--badge-bg)",
                color: "var(--muted-foreground)",
              }}
            >
              <SparklesIcon className="h-3.5 w-3.5 text-[#00acd7]" />
              Multi-platform Go CLI distributor
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute -left-4 -top-8 -z-10 select-none opacity-15 dark:opacity-25 sm:-left-8 sm:-top-10">
                <img src="/logo/drb99-logo.png" alt="drb99 watermark" className="h-40 w-auto object-contain sm:h-52 lg:h-64" />
              </div>

              <h1 className="max-w-2xl font-mono text-6xl font-extrabold tracking-tighter sm:text-7xl md:text-[5.5rem] lg:text-[6.5rem]" style={{ color: "var(--foreground)" }}>
                <span className="relative block">
                  drb99
                  <span
                    className="absolute left-[3px] top-[3px] -z-10 text-transparent"
                    style={{ WebkitTextStroke: "1.5px var(--border)" }}
                  >
                    drb99
                  </span>
                </span>
                <span className="mt-2 block text-3xl font-semibold tracking-tight sm:text-4xl lg:text-[2.75rem]">
                  release wiring that stays out of your way
                </span>
              </h1>
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed sm:text-lg lg:text-xl" style={{ color: "var(--muted-foreground)" }}>
              Start from a repo URL, prefill the details, and generate packaging files for the targets you actually ship.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/generate"
                className="group flex h-12 w-full items-center justify-center gap-2 border font-mono text-sm font-bold tracking-wide transition-all duration-100 hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none sm:w-56"
                style={{
                  background: "var(--btn-primary-bg)",
                  color: "var(--btn-primary-text)",
                  borderColor: "var(--btn-primary-bg)",
                  boxShadow: "3px 3px 0px 0px var(--btn-primary-shadow)",
                }}
              >
                Start Packaging
                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="https://github.com/h3yng/drb99"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 w-full items-center justify-center gap-2 border font-mono text-sm font-semibold transition-all duration-100 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:bg-[var(--surface-hover)] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none sm:w-56"
                style={{
                  borderColor: "var(--border)",
                  background: "var(--badge-bg)",
                  color: "var(--foreground)",
                  boxShadow: "3px 3px 0px 0px var(--badge-border)",
                }}
              >
                <GithubIcon className="h-4 w-4" />
                GitHub Repository
              </a>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {FEATURE_PILLS.map((pill) => (
                <span
                  key={pill}
                  className="border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
                  style={{
                    borderColor: "var(--badge-border)",
                    background: "var(--badge-bg)",
                    color: "var(--muted-foreground)",
                  }}
                >
                  {pill}
                </span>
              ))}
            </div>
          </section>

          <aside className="relative">
            <div
              className="absolute inset-0 -z-10 translate-x-4 translate-y-4 border"
              style={{ borderColor: "var(--border)", background: "var(--badge-bg)" }}
            />
            <div
              className="rounded-none border p-6 shadow-[6px_6px_0px_0px_var(--border)] backdrop-blur-xl sm:p-7"
              style={{
                borderColor: "var(--border)",
                background: "linear-gradient(180deg, var(--card), var(--surface))",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: "var(--muted-foreground)" }}>
                    Packaging targets
                  </p>
                  <p className="mt-1 text-sm" style={{ color: "var(--foreground)" }}>
                    Everything starts from the same repo metadata.
                  </p>
                </div>
                <span
                  className="border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em]"
                  style={{ borderColor: "var(--ring)", color: "var(--muted-foreground)" }}
                >
                  Live preview
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {TARGETS.map((target) => (
                  <div
                    key={target.label}
                    className="flex min-h-36 flex-col justify-between border p-4 transition-transform duration-150 hover:-translate-y-0.5"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                      borderRadius: 0,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <img src={target.icon} alt={target.label} className="h-8 w-8 object-contain" />
                      <span
                        className="border px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                        style={{ borderColor: "var(--input)", color: "var(--muted-foreground)" }}
                      >
                        Ready
                      </span>
                    </div>
                    <div className="mt-5">
                      <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        {target.label}
                      </h2>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                        {target.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 border p-4"
                style={{ borderColor: "var(--border)", background: "var(--badge-bg)", borderRadius: 0 }}
              >
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                  One repository URL in. Multiple release outputs out.
                </p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  The generator carries your repo details through each target so the output stays aligned.
                </p>
              </div>
            </div>
          </aside>
        </main>

        <footer className="flex items-center justify-between gap-4 border-t py-4" style={{ borderColor: "var(--border)" }}>
          <p className="text-xs font-mono" style={{ color: "var(--muted-foreground)" }}>
            © {new Date().getFullYear()} drb99. Open Source under AGPL-3.0.
          </p>
          <p className="text-xs uppercase tracking-[0.24em]" style={{ color: "var(--muted-foreground)" }}>
            Build once. Distribute everywhere.
          </p>
        </footer>
      </div>
    </div>
  );
}
