import React, { useState, useEffect, useRef, useCallback } from "react";
import { normalizeHttpsUrl, isAllowedHost, isSafeHex, styleSvg, sanitizeSvg } from "./svg";
import { subscribeToSelection, insertIconToCanvas, SelectionState } from "./webflow-api";

const SEARCH_ENDPOINT = "https://iconsearch.info/api/extension/icon-search";
const DEVICE_START_ENDPOINT = "https://iconsearch.info/api/device/start";
const DEVICE_STATUS_ENDPOINT = "https://iconsearch.info/api/device/status";
const AUTHORIZATION_ENDPOINT = "https://iconsearch.info/connect";
const SEARCH_LIMIT = 60;
const DEVICE_CODE_PATTERN = /^[A-Za-z0-9_-]{16,256}$/;
const SESSION_TOKEN_PATTERN = /^[A-Za-z0-9_-]{32,256}$/;

export function isAllowedAuthUrl(uri: string | null): boolean {
  if (!uri || typeof uri !== "string") return false;
  try {
    const parsed = new URL(uri.trim());
    const entries = Array.from(parsed.searchParams.entries());
    const code = parsed.searchParams.get("code") || "";
    return (
      parsed.origin === "https://iconsearch.info" &&
      parsed.pathname === "/connect" &&
      parsed.hash === "" &&
      parsed.username === "" &&
      parsed.password === "" &&
      entries.length === 2 &&
      parsed.searchParams.getAll("product").length === 1 &&
      parsed.searchParams.get("product") === "webflow" &&
      parsed.searchParams.getAll("code").length === 1 &&
      DEVICE_CODE_PATTERN.test(code)
    );
  } catch {
    return false;
  }
}

function createAuthorizationUrl(deviceCode: string): string {
  if (!DEVICE_CODE_PATTERN.test(deviceCode)) {
    throw new Error("The authorization server returned an invalid device code.");
  }

  const url = new URL(AUTHORIZATION_ENDPOINT);
  url.searchParams.set("product", "webflow");
  url.searchParams.set("code", deviceCode);
  return url.toString();
}

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

const SWATCHES = [
  ["#111827", "swatch-ink"],
  ["#FFFFFF", "swatch-white"],
  ["#2563EB", "swatch-blue"],
  ["#059669", "swatch-green"],
  ["#DC2626", "swatch-red"],
  ["#F4B400", "swatch-yellow"],
] as const;

export function App() {
  const [token, setToken] = useState<string | null>(null);
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
  const authControllerRef = useRef<AbortController | null>(null);
  const searchControllerRef = useRef<AbortController | null>(null);

  // Subscribe to Webflow Designer selection events
  useEffect(() => {
    const unsubscribe = subscribeToSelection((state) => {
      setSelection(state);
    });
    return () => unsubscribe();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      authControllerRef.current?.abort();
      searchControllerRef.current?.abort();
    };
  }, []);

  // Search requests only run after an explicit Search action.
  const fetchIcons = useCallback(async (isNewSearch = true) => {
    if (!token) return;

    if (isNewSearch) {
      setPage(1);
      setIcons([]);
      setSelectedIcon(null);
      setStatusMessage("");
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
        setToken(null);
        setStatusMessage("Your IconSearch session expired. Sign in again to continue.");
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
      setStatusMessage("Icon search failed. Check your connection and try again.");
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [query, library, style, legalOnly, page, token]);

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

  // Start Device Auth Pairing with bounded polling loop
  async function handleStartAuth() {
    authControllerRef.current?.abort();
    const authController = new AbortController();
    authControllerRef.current = authController;
    setStartingAuth(true);
    setAuthError(null);
    try {
      const res = await fetch(DEVICE_START_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: "webflow", clientName: "Webflow Extension" }),
        signal: authController.signal
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) throw new Error(String(data.error || "Failed to start device auth."));

      const code = String(data.deviceCode || "");
      const uCode = String(data.userCode || "");
      const authorizationUri = createAuthorizationUrl(code);

      setUserCode(uCode);
      setVerificationUri(authorizationUri);

      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      let pollAttempts = 0;
      const MAX_POLL_ATTEMPTS = 60;

      const pollDeviceStatus = async () => {
        pollAttempts++;
        if (pollAttempts > MAX_POLL_ATTEMPTS) {
          pollTimerRef.current = null;
          setAuthError("Pairing session expired. Please click Sign in to try again.");
          setUserCode(null);
          setVerificationUri(null);
          return;
        }

        try {
          const statusRes = await fetch(DEVICE_STATUS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceCode: code }),
            signal: authController.signal
          });
          const statusData = await statusRes.json() as Record<string, unknown>;
          if (
            statusRes.ok &&
            statusData.status === "authorized" &&
            typeof statusData.token === "string" &&
            SESSION_TOKEN_PATTERN.test(statusData.token)
          ) {
            pollTimerRef.current = null;
            setToken(statusData.token);
            setUserCode(null);
            setVerificationUri(null);
            setStatusMessage("Connected. Press Search when you are ready to load icons.");
            return;
          } else if (statusData.status === "authorized") {
            pollTimerRef.current = null;
            setAuthError("The authorization server returned an invalid session. Please try again.");
            setUserCode(null);
            setVerificationUri(null);
            return;
          } else if (statusData.status === "expired" || statusData.status === "denied") {
            pollTimerRef.current = null;
            setAuthError(`Pairing session ${statusData.status}. Please try again.`);
            setUserCode(null);
            setVerificationUri(null);
            return;
          }
        } catch {
          if (authController.signal.aborted) return;
        }

        if (!authController.signal.aborted) {
          pollTimerRef.current = window.setTimeout(() => void pollDeviceStatus(), 3000);
        }
      };

      pollTimerRef.current = window.setTimeout(() => void pollDeviceStatus(), 3000);
    } catch (err) {
      if (!authController.signal.aborted) {
        setAuthError(err instanceof Error ? err.message : "Pairing failed");
      }
    } finally {
      if (authControllerRef.current === authController) {
        setStartingAuth(false);
      }
    }
  }

  function handleSignOut() {
    searchControllerRef.current?.abort();
    authControllerRef.current?.abort();
    if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    setToken(null);
    setUserCode(null);
    setVerificationUri(null);
    setIcons([]);
    setSelectedIcon(null);
    setTotal(0);
    setStatusMessage("");
  }

  // Handle Icon Insertion into Webflow Canvas
  async function handleInsertIcon(icon: IconSearchIcon) {
    if (inserting) return;
    if (!selection.canInsert) {
      setStatusMessage(selection.reason || "Select a Webflow canvas element first.");
      return;
    }
    setInserting(true);
    setStatusMessage(`Inserting ${icon.displayName}...`);

    try {
      const res = await fetch(icon.svgUrl, { headers: { accept: "image/svg+xml,text/plain" } });
      if (!res.ok) throw new Error("Could not fetch SVG content.");
      if (!isAllowedHost(res.url)) throw new Error("The SVG response came from an unapproved host.");
      const contentLength = Number(res.headers.get("content-length") || "0");
      if (contentLength > 1_000_000) throw new Error("The selected SVG is too large to import safely.");
      const rawMarkup = await res.text();
      if (rawMarkup.length > 1_000_000) throw new Error("The selected SVG is too large to import safely.");
      const sanitized = sanitizeSvg(rawMarkup);
      const styled = styleSvg(sanitized, { color, title: icon.displayName, size });

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
          <div className="brand-mark">IS</div>
          <div>
            <h1 className="app-title">IconSearch</h1>
            <p className="app-subtitle">Webflow Designer Extension</p>
          </div>
        </div>
        <div className="header-status">
          {token ? (
            <button type="button" onClick={handleSignOut} className="tab-btn sign-out-button">Sign Out</button>
          ) : (
            <span className={`status-badge ${selection.canInsert ? "is-ready" : "is-warning"}`}>
              {selection.canInsert ? (selection.elementName ? `Target: ${selection.elementName}` : "Ready to Insert") : "No Selection"}
            </span>
          )}
        </div>
      </header>

      {/* CONNECT SCREEN FIRST (If not signed in) */}
      {!token ? (
        <div className="auth-card">
          <div className="brand-mark brand-mark-large">IS</div>
          <h2 className="auth-title">Connect IconSearch Account</h2>
          <p className="auth-description">
            Sign in to pair your IconSearch account and search 355,000+ vector icons inside Webflow.
          </p>

          {!verificationUri ? (
            <button
              type="button"
              className="btn-primary"
              disabled={startingAuth}
              onClick={handleStartAuth}
            >
              {startingAuth ? "Requesting pairing code..." : "Sign in with IconSearch"}
            </button>
          ) : (
            <div className="pairing-panel">
              {userCode && (
                <>
                  <p className="pairing-label">PAIRING CODE</p>
                  <div className="pairing-code">{userCode}</div>
                </>
              )}
              {isAllowedAuthUrl(verificationUri) && (
                <a
                  href={verificationUri!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary auth-link"
                >
                  Open Sign-In Page ↗
                </a>
              )}
              <p className="auth-waiting">Waiting for browser approval...</p>
            </div>
          )}

          {authError && <p className="auth-error">{authError}</p>}
        </div>
      ) : (
        /* MAIN CATALOG INTERFACE */
        <main className="app-main">
          {/* SEARCH BAR */}
          <form
            className="search-bar"
            onSubmit={(event) => {
              event.preventDefault();
              void fetchIcons(true);
            }}
          >
            <input
              type="text"
              className="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 355,000+ vector icons..."
            />
            <button type="submit" className="btn-primary search-button" disabled={loading}>
              {loading ? "Searching..." : "Search"}
            </button>
          </form>

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
          {statusMessage && <div className="status-banner" role="status" aria-live="polite">{statusMessage}</div>}

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
            <div className="controls-box controls-box-flush">
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

              <div className="swatch-row swatch-row-flush">
                {SWATCHES.map(([swatchColor, swatchClass]) => (
                  <button
                    key={swatchColor}
                    type="button"
                    className={`swatch-btn ${swatchClass} ${color.toUpperCase() === swatchColor ? "is-active" : ""}`}
                    onClick={() => setColor(swatchColor)}
                    aria-label={`Select color ${swatchColor}`}
                  />
                ))}
              </div>

              <button
                type="button"
                className="btn-primary insert-selected-button"
                disabled={!selectedIcon || !selection.canInsert || inserting}
                onClick={() => selectedIcon && void handleInsertIcon(selectedIcon)}
              >
                {inserting
                  ? "Inserting icon..."
                  : selectedIcon
                    ? "Insert selected icon"
                    : "Select an icon to insert"}
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
