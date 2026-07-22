export type OutputFormat = "react" | "svg" | "tailwind" | "vue" | "svelte" | "url";

export type StoredSession = {
  token: string;
  access?: Record<string, unknown>;
  savedAt: string;
};

export type DeviceStartResponse = {
  deviceCode: string;
  verificationUriComplete: string;
  interval: number;
  expiresIn: number;
};

export type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  npmPackage?: string;
  license?: string;
  legalSafe: boolean;
  svgUrl: string;
  previewUrls: string[];
  reactImport?: string;
  reactUsage?: string;
  tags: string[];
};

export type SearchResult = {
  icons: IconSearchIcon[];
  total: number;
  page: number;
  totalPages: number;
};
