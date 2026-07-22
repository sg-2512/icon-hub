import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LIBRARIES } from "./constants";
import { finishSignIn, searchIcons, startSignIn } from "./api";
import { clearPendingDeviceCode, clearSession, readPendingDeviceCode, readSession, savePendingDeviceCode, saveSession } from "./storage";
import { createSnippet } from "./snippets";
import type { IconSearchIcon, OutputFormat, StoredSession } from "./types";

export function IconSearchPanel() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession());
  const [pendingCode, setPendingCode] = useState(() => readPendingDeviceCode());
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState("all");
  const [format, setFormat] = useState<OutputFormat>("react");
  const [legalOnly, setLegalOnly] = useState(true);
  const [icons, setIcons] = useState<IconSearchIcon[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedIcon = useMemo(
    () => icons.find((icon) => icon.id === selectedId) || icons[0],
    [icons, selectedId],
  );

  const completeSignIn = useCallback(async (showPending = true) => {
    if (!pendingCode) {
      if (showPending) setError("Start sign-in first.");
      return;
    }
    try {
      const result = await finishSignIn(pendingCode);
      if (result === "pending") {
        if (showPending) setMessage("Still waiting for browser approval.");
        return;
      }
      saveSession(result);
      clearPendingDeviceCode();
      setSession(result);
      setPendingCode("");
      setMessage("IconSearch connected.");
    } catch (completeError) {
      setError(completeError instanceof Error ? completeError.message : "Could not complete sign-in.");
    }
  }, [pendingCode]);

  useEffect(() => {
    if (!session?.token) return;
    const controller = new AbortController();
    const handle = window.setTimeout(() => {
      setLoading(true);
      setError("");
      void searchIcons({
        token: session.token,
        query,
        library,
        legalOnly,
        signal: controller.signal,
      })
        .then((result) => {
          setIcons(result.icons);
          setSelectedId((current) => (result.icons.some((icon) => icon.id === current) ? current : result.icons[0]?.id || ""));
          setMessage(`${result.total.toLocaleString()} matching icons`);
        })
        .catch((searchError) => {
          if (!controller.signal.aborted) setError(searchError instanceof Error ? searchError.message : "Search failed.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 180);

    return () => {
      window.clearTimeout(handle);
      controller.abort();
    };
  }, [legalOnly, library, query, session?.token]);

  useEffect(() => {
    if (!pendingCode || session?.token) return;
    const handle = window.setInterval(() => {
      void completeSignIn(false);
    }, 3000);
    return () => window.clearInterval(handle);
  }, [completeSignIn, pendingCode, session?.token]);

  async function connect() {
    setError("");
    setMessage("Opening secure IconSearch sign-in...");
    try {
      const start = await startSignIn();
      savePendingDeviceCode(start.deviceCode);
      setPendingCode(start.deviceCode);
      window.open(start.verificationUriComplete, "_blank", "noopener,noreferrer");
      setMessage("Approve the browser link, then return here.");
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Could not start sign-in.");
    }
  }

  function signOut() {
    clearSession();
    clearPendingDeviceCode();
    setSession(null);
    setPendingCode("");
    setIcons([]);
    setSelectedId("");
    setMessage("Signed out.");
  }

  async function copyIcon(icon: IconSearchIcon | undefined) {
    if (!icon) return;
    try {
      const snippet = await createSnippet(icon, format);
      await navigator.clipboard.writeText(snippet);
      setMessage(`Copied ${format.toUpperCase()} for ${icon.displayName}.`);
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Could not copy snippet.");
    }
  }

  return (
    <div style={styles.shell}>
      <div style={styles.header}>
        <div>
          <div style={styles.kicker}>IconSearch</div>
          <strong style={styles.title}>Search production-safe icons</strong>
        </div>
        {session ? (
          <button type="button" style={styles.ghostButton} onClick={signOut}>Sign out</button>
        ) : (
          <button type="button" style={styles.primaryButton} onClick={connect}>Connect</button>
        )}
      </div>

      {!session ? (
        <div style={styles.emptyState}>
          <strong>Connect IconSearch to search live icons.</strong>
          <span>The addon stores only a revocable product token in this browser.</span>
          <div style={styles.row}>
            <button type="button" style={styles.primaryButton} onClick={connect}>Start sign-in</button>
            <button type="button" style={styles.ghostButton} onClick={() => void completeSignIn(true)} disabled={!pendingCode}>
              Complete
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={styles.toolbar}>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons, e.g. home, arrow, github..."
              style={styles.searchInput}
            />
            <select value={library} onChange={(event) => setLibrary(event.target.value)} style={styles.select}>
              {LIBRARIES.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <select value={format} onChange={(event) => setFormat(event.target.value as OutputFormat)} style={styles.select}>
              <option value="react">React</option>
              <option value="svg">SVG</option>
              <option value="tailwind">Tailwind</option>
              <option value="vue">Vue</option>
              <option value="svelte">Svelte</option>
              <option value="url">URL</option>
            </select>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" checked={legalOnly} onChange={(event) => setLegalOnly(event.target.checked)} />
              Legal-safe
            </label>
          </div>

          <div style={styles.content}>
            <div style={styles.grid} aria-busy={loading}>
              {icons.map((icon) => (
                <button
                  type="button"
                  key={icon.id}
                  style={icon.id === selectedIcon?.id ? { ...styles.card, ...styles.cardActive } : styles.card}
                  onClick={() => setSelectedId(icon.id)}
                  onDoubleClick={() => void copyIcon(icon)}
                >
                  <span style={styles.preview}>
                    <img src={icon.svgUrl} alt="" style={styles.previewImage} />
                  </span>
                  <span style={styles.cardTitle}>{icon.displayName}</span>
                  <span style={styles.cardSubtitle}>{icon.libraryName}</span>
                </button>
              ))}
              {!loading && icons.length === 0 ? <div style={styles.emptyInline}>No icons found.</div> : null}
            </div>

            <aside style={styles.detail}>
              {selectedIcon ? (
                <>
                  <div style={styles.largePreview}>
                    <img src={selectedIcon.svgUrl} alt="" style={styles.largePreviewImage} />
                  </div>
                  <h3 style={styles.detailTitle}>{selectedIcon.displayName}</h3>
                  <p style={styles.muted}>{selectedIcon.libraryName} · {selectedIcon.license || "license unknown"}</p>
                  <code style={styles.code}>{selectedIcon.name}</code>
                  <button type="button" style={styles.primaryButtonWide} onClick={() => void copyIcon(selectedIcon)}>
                    Copy {format.toUpperCase()}
                  </button>
                </>
              ) : (
                <p style={styles.muted}>Select an icon to preview and copy.</p>
              )}
            </aside>
          </div>
        </>
      )}

      <div style={error ? styles.errorBar : styles.statusBar}>
        {error || message || "Ready"}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100%",
    background: "#111318",
    color: "#f8fafc",
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: 16,
    borderBottom: "1px solid rgba(148,163,184,.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  kicker: { color: "#38bdf8", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" },
  title: { display: "block", marginTop: 4, fontSize: 15 },
  toolbar: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 160px 120px 110px",
    gap: 8,
    padding: 12,
    borderBottom: "1px solid rgba(148,163,184,.18)",
  },
  searchInput: {
    height: 34,
    border: "1px solid rgba(148,163,184,.28)",
    borderRadius: 8,
    padding: "0 10px",
    background: "#171a21",
    color: "#f8fafc",
  },
  select: {
    height: 34,
    border: "1px solid rgba(148,163,184,.28)",
    borderRadius: 8,
    padding: "0 8px",
    background: "#171a21",
    color: "#f8fafc",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#cbd5e1",
    fontSize: 12,
  },
  content: { display: "grid", gridTemplateColumns: "minmax(360px, 1fr) 260px", minHeight: 0, flex: 1 },
  grid: {
    padding: 12,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
    gap: 10,
    overflow: "auto",
    alignContent: "start",
  },
  card: {
    minHeight: 144,
    border: "1px solid rgba(148,163,184,.14)",
    borderRadius: 8,
    background: "#181b22",
    color: "#f8fafc",
    padding: 10,
    textAlign: "left",
    cursor: "pointer",
  },
  cardActive: { borderColor: "#38bdf8", boxShadow: "0 0 0 1px #38bdf8 inset" },
  preview: {
    height: 70,
    borderRadius: 6,
    background: "#f8fafc",
    display: "grid",
    placeItems: "center",
    marginBottom: 10,
  },
  previewImage: { width: 38, height: 38, objectFit: "contain" },
  cardTitle: { display: "block", fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  cardSubtitle: { display: "block", marginTop: 3, color: "#94a3b8", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  detail: { borderLeft: "1px solid rgba(148,163,184,.18)", padding: 16, overflow: "auto" },
  largePreview: { height: 132, borderRadius: 8, background: "#f8fafc", display: "grid", placeItems: "center" },
  largePreviewImage: { width: 70, height: 70, objectFit: "contain" },
  detailTitle: { margin: "14px 0 6px", fontSize: 18 },
  muted: { color: "#94a3b8", lineHeight: 1.5, fontSize: 12 },
  code: { display: "block", background: "#222631", color: "#e2e8f0", borderRadius: 6, padding: 8, margin: "12px 0" },
  primaryButton: { border: 0, borderRadius: 8, background: "#38bdf8", color: "#031018", fontWeight: 900, padding: "8px 12px", cursor: "pointer" },
  primaryButtonWide: { border: 0, borderRadius: 8, background: "#38bdf8", color: "#031018", fontWeight: 900, padding: "10px 12px", cursor: "pointer", width: "100%" },
  ghostButton: { border: "1px solid rgba(148,163,184,.25)", borderRadius: 8, background: "transparent", color: "#e2e8f0", fontWeight: 800, padding: "8px 12px", cursor: "pointer" },
  emptyState: { margin: 16, padding: 20, border: "1px solid rgba(148,163,184,.18)", borderRadius: 10, background: "#171a21", display: "grid", gap: 10, color: "#cbd5e1" },
  emptyInline: { color: "#94a3b8", padding: 16 },
  row: { display: "flex", gap: 8, flexWrap: "wrap" },
  statusBar: { borderTop: "1px solid rgba(148,163,184,.18)", padding: "9px 12px", color: "#94a3b8", fontSize: 12 },
  errorBar: { borderTop: "1px solid rgba(244,63,94,.35)", padding: "9px 12px", color: "#fda4af", background: "rgba(244,63,94,.08)", fontSize: 12 },
};
