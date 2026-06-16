"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { NpmWrapperFormData } from "@/components/forms/npm-wrapper-form";
import type { GoReleaseFormData } from "@/components/forms/go-release-form";
import type { AurFormData } from "@/components/forms/aur-form";
import type { NixFormData } from "@/components/forms/nix-form";
import type { DockerFormData } from "@/components/forms/docker-form";
import {
  INITIAL_NPM_WRAPPER_DATA,
} from "@/components/forms/npm-wrapper-form";
import {
  INITIAL_GO_RELEASE_DATA,
} from "@/components/forms/go-release-form";
import {
  INITIAL_AUR_FORM_DATA,
} from "@/components/forms/aur-form";
import {
  INITIAL_NIX_FORM_DATA,
} from "@/components/forms/nix-form";
import {
  INITIAL_DOCKER_FORM_DATA,
} from "@/components/forms/docker-form";

export type DistributorType = "npm_wrapper" | "goreleaser" | "github_actions" | "aur" | "nix" | "docker";

export interface PrefillResponse {
  repo_url?: string;
  binary_name?: string;
  package_name?: string;
  license?: string;
  description?: string;
  version?: string;
  platforms?: string[];
  asset_urls?: Record<string, string[]>;
}

export interface AppContextType {
  repoUrl: string;
  setRepoUrl: (url: string) => void;
  
  selectedDistributors: Set<DistributorType>;
  toggleDistributor: (type: DistributorType) => void;
  
  activeDistributor: DistributorType | null;
  setActiveDistributor: (type: DistributorType | null) => void;
  
  npmWrapperData: NpmWrapperFormData;
  setNpmWrapperData: (data: NpmWrapperFormData) => void;
  
  goReleaserData: GoReleaseFormData;
  setGoReleaserData: (data: GoReleaseFormData) => void;

  aurData: AurFormData;
  setAurData: (data: AurFormData) => void;

  nixData: NixFormData;
  setNixData: (data: NixFormData) => void;

  dockerData: DockerFormData;
  setDockerData: (data: DockerFormData) => void;

  prefillRepoUrl: string | null;
  setPrefillRepoUrl: (value: string | null) => void;

  prefillIssue: string | null;
  setPrefillIssue: (value: string | null) => void;
  
  reset: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [repoUrl, setRepoUrl] = useState("");
  const [selectedDistributors, setSelectedDistributors] = useState<Set<DistributorType>>(new Set());
  const [activeDistributor, setActiveDistributor] = useState<DistributorType | null>(null);
  const [npmWrapperData, setNpmWrapperData] = useState<NpmWrapperFormData>(INITIAL_NPM_WRAPPER_DATA);
  const [goReleaserData, setGoReleaserData] = useState<GoReleaseFormData>(INITIAL_GO_RELEASE_DATA);
  const [aurData, setAurData] = useState<AurFormData>(INITIAL_AUR_FORM_DATA);
  const [nixData, setNixData] = useState<NixFormData>(INITIAL_NIX_FORM_DATA);
  const [dockerData, setDockerData] = useState<DockerFormData>(INITIAL_DOCKER_FORM_DATA);
  const [prefillRepoUrl, setPrefillRepoUrl] = useState<string | null>(null);
  const [prefillIssue, setPrefillIssue] = useState<string | null>(null);

  const toggleDistributor = (type: DistributorType) => {
    const newSet = new Set(selectedDistributors);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedDistributors(newSet);
    
    if (activeDistributor === null && newSet.size > 0) {
      setActiveDistributor(type);
    }
    
    if (!newSet.has(activeDistributor as DistributorType)) {
      const remaining = Array.from(newSet)[0] || null;
      setActiveDistributor(remaining as DistributorType | null);
    }
  };

  const reset = () => {
    setRepoUrl("");
    setSelectedDistributors(new Set());
    setActiveDistributor(null);
    setNpmWrapperData(INITIAL_NPM_WRAPPER_DATA);
    setGoReleaserData(INITIAL_GO_RELEASE_DATA);
    setAurData(INITIAL_AUR_FORM_DATA);
    setNixData(INITIAL_NIX_FORM_DATA);
    setDockerData(INITIAL_DOCKER_FORM_DATA);
    setPrefillRepoUrl(null);
    setPrefillIssue(null);
  };

  return (
    <AppContext.Provider
      value={{
        repoUrl,
        setRepoUrl,
        selectedDistributors,
        toggleDistributor,
        activeDistributor,
        setActiveDistributor,
        npmWrapperData,
        setNpmWrapperData,
        goReleaserData,
        setGoReleaserData,
        aurData,
        setAurData,
        nixData,
        setNixData,
        dockerData,
        setDockerData,
        prefillRepoUrl,
        setPrefillRepoUrl,
        prefillIssue,
        setPrefillIssue,
        reset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
