export type StoredSession = {
  token: string;
  access?: Record<string, unknown>;
  savedAt: string;
};

export type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  license?: string;
  legalSafe: boolean;
  svgUrl: string;
  previewUrls: string[];
  tags: string[];
};

export type SearchResult = {
  icons: IconSearchIcon[];
  total: number;
};
