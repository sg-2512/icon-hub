import React, { useState, useEffect, useRef, useCallback } from "react";
import { normalizeHttpsUrl, isSafeHex, styleSvg, sanitizeSvg } from "./svg";
import { checkSelectionState, insertIconToCanvas, resolveWebflowUserToken, SelectionState } from "./webflow-api";

const SEARCH_ENDPOINT = "https://iconsearch.info/api/extension/icon-search";
const DEVICE_START_ENDPOINT = "https://iconsearch.info/api/device/start";
const DEVICE_STATUS_ENDPOINT = "https://iconsearch.info/api/device/status";
const TOKEN_KEY = "iconsearch_webflow_token";
const SEARCH_LIMIT = 60;

type IconSearchIcon = {
  id: string;
  name: string;
  displayName: string;
  library: string;
  libraryName: string;
  license: string;
  svgUrl: string;
  previewUrls: string[];
};

const LIBRARIES = [
  ["all", "All libraries (355k+)"],
  ["lucide-icons", "Lucide Icons"],
  ["heroicons", "Heroicons"],
  ["tabler-icons", "Tabler Icons"],
  ["phosphor-icons", "Phosphor Icons"],
  ["remix-icon", "Remix Icon"],
  ["feather-icons", "Feather Icons"],
  ["bootstrap-icons", "Bootstrap Icons"],
  ["ant-design-icons", "Ant Design Icons"],
  ["radix-icons", "Radix Icons"],
  ["octicons", "Octicons (GitHub)"],
  ["iconify-icons", "Material Design / Iconify"],
  ["ionicons", "Ionicons"],
  ["iconoir", "Iconoir"],
  ["devicons", "Devicons"],
  ["circum-icons", "Circum Icons"],
  ["elusive-icons", "Elusive Icons"],
  ["teenyicons", "Teenyicons"],
  ["untitled-ui-icons", "Untitled UI Icons"],
] as const;

const STYLES = [
  ["all", "All styles"],
  ["stroke", "Outline"],
  ["solid", "Solid"],
  ["duotone", "Duotone"],
  ["twotone", "Two-tone"],
  ["sharp", "Sharp"],
] as const;

function getSavedToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function saveToken(t: string): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, t);
  } catch {}
}

function clearToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
  } catch {}
}

export function App() {
  const [token, setToken] = useState<string | null>(getSavedToken());
  const [query, setQuery] = useState("arrow");
  const [library, setLibrary] = useState("all");
  const [style, setStyle] = useState("all");
  const [legalOnly, setLegalOnly] = useState(true);
  const [size, setSize] = useState(64);
  const [color, setColor] = useState("#111827");
  const [view, setView] = useState<"browse" | "recent">("browse");

  const [icons, setIcons] = useState<IconSearchIcon[]>([]);
  const [recentIcons, setRecentIcons] = useState<IconSearchIcon[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconSearchIcon | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [userCode, setUserCode] = useState<string | null>(null);
  const [verificationUri, setVerificationUri] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [startingAuth, setStartingAuth] = useState(false);

  const [selection, setSelection] = useState<SelectionState>({
    hasSelection: false,
    canInsert: false,
    reason: "Checking Webflow selection..."
  });
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [inserting, setInserting] = useState(false);

  const pollTimerRef = useRef<number | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);

  // Poll Webflow Designer Canvas selection
  useEffect(() => {
    async function pollSelection() {
      const state = await checkSelectionState();
      setSelection(state);
    }
    void pollSelection();
    const interval = setInterval(() => void pollSelection(), 1200);
    return () => clearInterval(interval);
  }, []);

  // Try auto-resolution via Webflow ID Token on mount
  useEffect(() => {
    async function checkNativeIdToken() {
      if (token) return;
      const idToken = await resolveWebflowUserToken();
      if (idToken) {
        setToken(idToken);
        saveToken(idToken);
      }
    }
    void checkNativeIdToken();
  }, [token]);

  // Execute Icon Search
  const fetchIcons = useCallback(async (isNewSearch = true) => {
    if (!token) return;

    if (isNewSearch) {
      setPage(1);
      setIcons([]);
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    searchControllerRef.current?.abort();
    const controller = new AbortController();
    searchControllerRef.current = controller;

    const currentPage = isNewSearch ? 1 : page + 1;
    const url = new URL(SEARCH_ENDPOINT);
    if (query.trim()) url.searchParams.set("q", query.trim());
    url.searchParams.set("lib", library);
    url.searchParams.set("style", style);
    url.searchParams.set("legalOnly", legalOnly ? "1" : "0");
    url.searchParams.set("page", String(currentPage));
    url.searchParams.set("limit", String(SEARCH_LIMIT));
    url.searchParams.set("sort", query.trim() ? "relevance" : "popular");

    try {
      const headers: Record<string, string> = {
        accept: "application/json",
        "x-iconsearch-product": "webflow",
        authorization: `Bearer ${token}`
      };

      const res = await fetch(url.toString(), {
        headers,
        signal: controller.signal
      });

      if (res.status === 401) {
        clearToken();
        setToken(null);
        return;
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { icons?: unknown[]; total?: number };
      const rawList = Array.isArray(data.icons) ? data.icons : [];

      const parsedIcons: IconSearchIcon[] = [];
      for (const item of rawList) {
        if (!item || typeof item !== "object") continue;
        const record = item as Record<string, unknown>;
        const name = String(record.name || "").trim();
        const lib = String(record.library || "").trim();
        const svgUrl = normalizeHttpsUrl(record.svgUrl);
        if (!name || !lib || !svgUrl) continue;
        parsedIcons.push({
          id: String(record.id || `${lib}-${name}`),
          name,
          displayName: String(record.displayName || name),
          library: lib,
          libraryName: String(record.libraryName || lib),
          license: String(record.license || "Open License"),
          svgUrl,
          previewUrls: [svgUrl]
        });
      }

      if (isNewSearch) {
        setIcons(parsedIcons);
        if (parsedIcons.length > 0) setSelectedIcon(parsedIcons[0]);
      } else {
        setIcons((prev) => [...prev, ...parsedIcons]);
        setPage(currentPage);
      }

      setTotal(Number(data.total) || parsedIcons.length);
    } catch (err) {
      if (controller.signal.aborted) return;
      if (isNewSearch) {
        setIcons([]);
        setTotal(0);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [query, library, style, legalOnly, page, token]);

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => void fetchIcons(true), 200);
    return () => clearTimeout(timer);
  }, [query, library, style, legalOnly, token]);

  // Handle Infinite Scroll
  useEffect(() => {
    function handleScroll() {
      if (!token || view !== "browse" || loading || loadingMore || icons.length >= total) return;
      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.offsetHeight - 400;
      if (scrollPosition >= threshold) {
        void fetchIcons(false);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [view, loading, loadingMore, icons.length, total, fetchIcons, token]);

  // Start Device Auth Pairing
  async function handleStartAuth() {
    setStartingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch(DEVICE_START_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "webflow", clientName: "Webflow Extension" })
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) throw new Error(String(data.error || "Failed to start device auth."));

      const code = String(data.deviceCode || "");
      const uCode = String(data.userCode || "");
      const uri = String(data.verificationUriComplete || `https://iconsearch.info/connect?product=webflow&code=${code}`);

      setUserCode(uCode);
      setVerificationUri(uri);

      // Validate popup origin strictly before opening
      if (uri.startsWith("https://iconsearch.info")) {
        window.open(uri, "_blank", "noopener,noreferrer");
      }

      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      pollTimerRef.current = window.setInterval(async () => {
        try {
          const statusRes = await fetch(DEVICE_STATUS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceCode: code })
          });
          const statusData = await statusRes.json() as Record<string, unknown>;
          if (statusRes.ok && statusData.status === "authorized" && typeof statusData.token === "string") {
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            saveToken(statusData.token);
            setToken(statusData.token);
          }
        } catch {}
      }, 3000);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Pairing failed");
    } finally {
      setStartingAuth(false);
    }
  }

  function handleSignOut() {
    clearToken();
    setToken(null);
    setUserCode(null);
    setVerificationUri(null);
  }

  // Handle Icon Insertion into Webflow Canvas
  async function handleInsertIcon(icon: IconSearchIcon) {
    if (!selection.canInsert) {
      setStatusMessage(selection.reason || "Select a Webflow canvas element first.");
      return;
    }
    setInserting(true);
    setStatusMessage(`Inserting ${icon.displayName}...`);

    try {
      const res = await fetch(icon.svgUrl, { headers: { accept: "image/svg+xml,text/plain" } });
      if (!res.ok) throw new Error("Could not fetch SVG content.");
      const rawMarkup = await res.text();
      const sanitized = sanitizeSvg(rawMarkup);
      const styled = styleSvg(sanitized, { color, title: icon.displayName });

      await insertIconToCanvas({
        svgMarkup: styled,
        iconName: icon.displayName,
        size
      });

      setStatusMessage(`Inserted ${icon.displayName} successfully!`);
      setRecentIcons((prev) => [icon, ...prev.filter((i) => i.id !== icon.id)].slice(0, 20));
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Failed to insert icon.");
    } finally {
      setInserting(false);
    }
  }

  const displayedIcons = view === "recent" ? recentIcons : icons;

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="app-header">
        <div className="brand-section">
          <div style={{ width: 28, height: 28, borderRadius: 6, background: "#2563EB", color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13 }}>IS</div>
          <div>
            <h1 className="app-title">IconSearch</h1>
            <p className="app-subtitle">Webflow Designer Extension</p>
          </div>
        </div>
        <div className="header-status">
          {token ? (
            <button type="button" onClick={handleSignOut} className="tab-btn" style={{ padding: "2px 6px", fontSize: 10 }}>Sign Out</button>
          ) : (
            <span className={`status-badge ${selection.canInsert ? "is-ready" : "is-warning"}`}>
              {selection.canInsert ? (selection.elementName ? `Target: ${selection.elementName}` : "Ready to Insert") : "No Selection"}
            </span>
          )}
        </div>
      </header>

      {/* CONNECT SCREEN FIRST (If not signed in) */}
      {!token ? (
        <div className="auth-card" style={{ padding: "24px 16px", textAlign: "center", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--line)", margin: "20px 0" }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: "#2563EB", color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 900, fontSize: 18, margin: "0 auto 12px" }}>IS</div>
          <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 6 }}>Connect IconSearch Account</h2>
          <p style={{ fontSize: 11, color: "var(--muted)", marginBottom: 16, lineHeight: 1.4 }}>
            Sign in to pair your IconSearch account and search 355,000+ vector icons inside Webflow.
          </p>

          {!userCode ? (
            <button
              type="button"
              className="btn-primary"
              disabled={startingAuth}
              onClick={handleStartAuth}
            >
              {startingAuth ? "Requesting pairing code..." : "Sign in with IconSearch"}
            </button>
          ) : (
            <div style={{ padding: 12, background: "var(--surface-subtle)", borderRadius: 8, border: "1px solid var(--line)" }}>
              <p style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700, margin: "0 0 4px" }}>PAIRING CODE</p>
              <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: "0.1em", color: "#2563EB", margin: "4px 0 10px" }}>{userCode}</div>
              <a
                href={verificationUri || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", height: 36 }}
              >
                Open Sign-In Page ↗
              </a>
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 8 }}>Waiting for browser approval...</p>
            </div>
          )}

          {authError && <p style={{ fontSize: 11, color: "#ef4444", marginTop: 10 }}>{authError}</p>}
        </div>
      ) : (
        /* MAIN CATALOG INTERFACE */
        <main className="app-main">
          {/* SEARCH BAR */}
          <div className="search-bar">
            <input
              type="text"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 355,000+ vector icons..."
            />
          </div>

          {/* FILTERS */}
          <div className="filter-grid">
            <select value={library} onChange={(e) => setLibrary(e.target.value)} className="select-control">
              {LIBRARIES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
            <select value={style} onChange={(e) => setStyle(e.target.value)} className="select-control">
              {STYLES.map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* TABS */}
          <div className="view-tabs">
            <button
              type="button"
              className={`tab-btn ${view === "browse" ? "is-active" : ""}`}
              onClick={() => setView("browse")}
            >
              Browse ({total.toLocaleString()})
            </button>
            <button
              type="button"
              className={`tab-btn ${view === "recent" ? "is-active" : ""}`}
              onClick={() => setView("recent")}
            >
              Recent ({recentIcons.length})
            </button>
          </div>

          {/* STATUS BAR */}
          {statusMessage && <div className="status-banner">{statusMessage}</div>}

          {/* ICON GRID (SCROLLABLE MIDDLE) */}
          {loading ? (
            <div className="loading-indicator">Searching icons...</div>
          ) : (
            <div className="results-grid">
              {displayedIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  className={`icon-card ${selectedIcon?.id === icon.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedIcon(icon)}
                  onDoubleClick={() => void handleInsertIcon(icon)}
                  title={`${icon.displayName} | ${icon.libraryName}`}
                >
                  <span
                    className="card-add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIcon(icon);
                      void handleInsertIcon(icon);
                    }}
                    title="Insert into Webflow canvas"
                  >
                    +
                  </span>
                  <div className="icon-card-preview">
                    <img src={icon.svgUrl} loading="lazy" alt="" className="icon-img" />
                  </div>
                  <span className="icon-name">{icon.displayName}</span>
                  <span className="icon-lib">{icon.libraryName}</span>
                </button>
              ))}
            </div>
          )}

          {loadingMore && <div className="loading-indicator">Loading more icons...</div>}

          {/* STICKY BOTTOM DOCK (ALWAYS VISIBLE PINNED AT BOTTOM) */}
          <div className="sticky-bottom-dock">
            {/* SELECTED ICON CARD */}
            <div className="selected-panel">
              <div className="selected-preview-box">
                {selectedIcon ? (
                  <img src={selectedIcon.svgUrl} alt={selectedIcon.displayName} className="selected-preview-img" />
                ) : (
                  <span className="no-selection-placeholder">No Icon</span>
                )}
              </div>
              <div className="selected-info">
                <h2 className="selected-title">{selectedIcon ? selectedIcon.displayName : "Select an Icon"}</h2>
                <p className="selected-meta">{selectedIcon ? `${selectedIcon.libraryName} | ${selectedIcon.license}` : "Click + or double-click to insert"}</p>
              </div>
            </div>

            {/* COMPACT CONTROLS */}
            <div className="controls-box" style={{ marginBottom: 0 }}>
              <div className="control-row">
                <label className="control-label">
                  <span>Size ({size}px)</span>
                  <input
                    type="range"
                    min="16"
                    max="512"
                    step="8"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="range-input"
                  />
                </label>
                <label className="control-label">
                  <span>Color</span>
                  <div className="color-picker-wrap">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="color-input"
                    />
                    <input
                      type="text"
                      value={color.toUpperCase()}
                      onChange={(e) => isSafeHex(e.target.value) && setColor(e.target.value)}
                      className="hex-input"
                      maxLength={7}
                    />
                  </div>
                </label>
              </div>

              <div className="swatch-row" style={{ marginBottom: 0 }}>
                {["#111827", "#FFFFFF", "#2563EB", "#059669", "#DC2626", "#F4B400"].map((swatchColor) => (
                  <button
                    key={swatchColor}
                    type="button"
                    className={`swatch-btn ${color.toUpperCase() === swatchColor ? "is-active" : ""}`}
                    style={{ backgroundColor: swatchColor }}
                    onClick={() => setColor(swatchColor)}
                    aria-label={`Select color ${swatchColor}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
