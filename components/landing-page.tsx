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
];

export function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden px-4 py-8 font-sans selection:bg-zinc-800">
      {/* Base Background Color Layer */}
      <div className="absolute inset-0 -z-30" style={{ background: "var(--background)" }} />

      {/* Dynamic Keyframes injected locally */}
      <style dangerouslySetInnerHTML={{
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
        `
      }} />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 -z-20 opacity-[0.03] dark:opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(var(--foreground) 1px, transparent 1px)`, 
          backgroundSize: '24px 24px' 
        }} 
      />

      {/* Floating Background Icons */}
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

      {/* Custom variable set for floating icons based on theme context */}
      <style dangerouslySetInnerHTML={{
        __html: `
          :root {
            --floating-icon-opacity: 0.12;
          }
          .dark {
            --floating-icon-opacity: 0.20;
          }
        `
      }} />

      {/* Top Header */}
      <header className="z-10 flex w-full max-w-6xl items-center justify-end">
        <ThemeToggle />
      </header>

      {/* Main Hero & Content (Centered) */}
      <main className="z-10 my-auto flex w-full max-w-4xl flex-col items-center text-center">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-1.5 border border-muted-foreground/30 bg-muted/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest backdrop-blur-md"
          style={{
            borderColor: "var(--badge-border)",
            background: "var(--badge-bg)",
            color: "var(--muted-foreground)",
          }}
        >
          <SparklesIcon className="h-3.5 w-3.5 text-[#00acd7]" />
          Multi-Platform Go CLI Distributor
        </div>

        {/* Title "drb99" with logo in the background */}
        <div className="relative flex items-center justify-center w-full">
          <div className="pointer-events-none absolute -z-10 select-none opacity-20 dark:opacity-30 -translate-y-10 sm:-translate-y-12 md:-translate-y-16">
            <img 
              src="/logo/logo.png" 
              alt="drb99 Watermark" 
              className="h-32 sm:h-40 md:h-48 w-auto object-contain"
            />
          </div>
          <h1 className="relative font-mono text-7xl font-extrabold tracking-tighter sm:text-8xl md:text-[8rem] select-none" style={{ color: "var(--foreground)" }}>
            <span className="relative z-10">drb99</span>
            <span 
              className="absolute left-[4px] top-[4px] -z-10 select-none font-mono text-7xl font-extrabold tracking-tighter sm:text-8xl md:text-[8rem] text-transparent"
              style={{ WebkitTextStroke: "1.5px var(--border)" }}
            >
              drb99
            </span>
          </h1>
        </div>

        {/* Subtitle / Paragraph */}
        <p className="mt-6 max-w-xl text-base leading-relaxed sm:text-lg md:text-xl" style={{ color: "var(--muted-foreground)" }}>
          drb99 makes releasing less painful. Pick your channels, and get your configuration files.
        </p>

        {/* Primary and Secondary Actions (2D Neo-brutalist buttons) */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            href="/generate"
            className="group flex h-12 w-full sm:w-56 items-center justify-center gap-2 border border-foreground font-mono text-sm font-bold tracking-wide transition-all duration-100 hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] hover:shadow-[4px_4px_0px_0px_var(--btn-primary-shadow)] active:shadow-none"
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
            className="flex h-12 w-full sm:w-56 items-center justify-center gap-2 border font-mono text-sm font-semibold transition-all duration-100 hover:bg-muted/30 hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[3px] active:translate-y-[3px] hover:shadow-[4px_4px_0px_0px_var(--badge-border)] active:shadow-none"
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
      </main>

      {/* Footer */}
      <footer className="z-10 mt-16 w-full max-w-6xl border-t pt-8 flex items-center justify-between" style={{ borderColor: "var(--border)" }}>
        <p className="text-xs text-muted-foreground font-mono">
          © {new Date().getFullYear()} drb99. Open Source under AGPL-3.0.
        </p>
      </footer>
    </div>
  );
}
