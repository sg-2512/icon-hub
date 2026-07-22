import React, { useCallback, useEffect, useMemo, useState } from "react";
import { upload } from "@canva/asset";
import { addElementAtPoint } from "@canva/design";
import type { ImageElementAtPoint } from "@canva/design";
import { notification, requestOpenExternalUrl } from "@canva/platform";
import {
  LIBRARIES,
  clearPendingDeviceCode,
  clearSession,
  fetchSvgMarkup,
  finishSignIn,
  readPendingDeviceCode,
  readSession,
  savePendingDeviceCode,
  saveSession,
  searchIcons,
  startSignIn,
} from "./api";
import type { IconSearchIcon, StoredSession } from "./types";
import "./styles.css";

const ICON_SIZE = 192;

export function App() {
  const [session, setSession] = useState<StoredSession | null>(() => readSession());
  const [pendingCode, setPendingCode] = useState(() => readPendingDeviceCode());
  const [query, setQuery] = useState("");
  const [library, setLibrary] = useState("all");
  const [legalOnly, setLegalOnly] = useState(true);
  const [icons, setIcons] = useState<IconSearchIcon[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [busyIconId, setBusyIconId] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Connect IconSearch to search and insert SVG icons.");
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
        if (showPending) setStatus("Still waiting for browser approval.");
        return;
      }
      saveSession(result);
      clearPendingDeviceCode();
      setSession(result);
      setPendingCode("");
      setStatus("IconSearch connected.");
      void notification.addToast({ messageText: "IconSearch connected." });
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
          setStatus(`${result.total.toLocaleString()} matching icons`);
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
    setStatus("Opening secure IconSearch sign-in...");
    try {
      const start = await startSignIn();
      savePendingDeviceCode(start.deviceCode);
      setPendingCode(start.deviceCode);
      await requestOpenExternalUrl({ url: start.verificationUriComplete });
      setStatus("Approve the browser link, then return to Canva.");
    } catch (connectError) {
      setError(connectError instanceof Error ? connectError.message : "Could not start sign-in.");
    }
  }

  function signOut() {
    clearSession();
    setSession(null);
    setPendingCode("");
    setIcons([]);
    setSelectedId("");
    setStatus("Signed out.");
  }

  async function insertIcon(icon: IconSearchIcon | undefined) {
    if (!icon) return;
    setBusyIconId(icon.id);
    setError("");
    setStatus(`Preparing ${icon.displayName}...`);

    try {
      const svg = await fetchSvgMarkup(icon);
      const dataUrl = svgToDataUrl(svg);
      const asset = await upload({
        type: "image",
        url: dataUrl,
        thumbnailUrl: dataUrl,
        mimeType: "image/svg+xml",
        name: `${icon.displayName} icon`,
        aiDisclosure: "none",
        width: ICON_SIZE,
        height: ICON_SIZE,
      });

      await asset.whenUploaded();

      const element: ImageElementAtPoint = {
        type: "image",
        ref: asset.ref,
        altText: { text: `${icon.displayName} icon`, decorative: false },
        top: 120,
        left: 120,
        width: ICON_SIZE,
        height: ICON_SIZE,
      };

      await addElementAtPoint(element);
      setStatus(`Inserted ${icon.displayName}.`);
      void notification.addToast({ messageText: `Inserted ${icon.displayName}.` });
    } catch (insertError) {
      setError(insertError instanceof Error ? insertError.message : "Could not insert icon.");
    } finally {
      setBusyIconId("");
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <div className="kicker">IconSearch</div>
          <h1>Search icons</h1>
        </div>
        {session ? (
          <button type="button" className="ghost-button" onClick={signOut}>Sign out</button>
        ) : (
          <button type="button" className="primary-button" onClick={connect}>Connect</button>
        )}
      </header>

      {!session ? (
        <section className="connect-panel">
          <strong>Connect your IconSearch account</strong>
          <p>The app stores only a revocable Canva product token in this browser.</p>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={connect}>Start sign-in</button>
            <button type="button" className="ghost-button" onClick={() => void completeSignIn(true)} disabled={!pendingCode}>
              Complete
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="filters">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search home, arrow, logo..."
              aria-label="Search icons"
            />
            <select value={library} onChange={(event) => setLibrary(event.target.value)} aria-label="Icon library">
              {LIBRARIES.map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <label className="check-row">
              <input type="checkbox" checked={legalOnly} onChange={(event) => setLegalOnly(event.target.checked)} />
              Legal-safe
            </label>
          </section>

          <section className="preview-panel" aria-live="polite">
            {selectedIcon ? (
              <>
                <div className="large-preview">
                  <img src={selectedIcon.svgUrl} alt="" />
                </div>
                <div>
                  <strong>{selectedIcon.displayName}</strong>
                  <span>{selectedIcon.libraryName} · {selectedIcon.license || "license unknown"}</span>
                </div>
                <button type="button" className="primary-button wide" onClick={() => void insertIcon(selectedIcon)} disabled={Boolean(busyIconId)}>
                  {busyIconId === selectedIcon.id ? "Inserting..." : "Insert selected"}
                </button>
              </>
            ) : (
              <span className="muted">Search and select an icon to insert.</span>
            )}
          </section>

          <section className="icon-grid" aria-busy={loading}>
            {icons.map((icon) => (
              <button
                type="button"
                key={icon.id}
                className={icon.id === selectedIcon?.id ? "icon-card active" : "icon-card"}
                onClick={() => setSelectedId(icon.id)}
                onDoubleClick={() => void insertIcon(icon)}
              >
                <span className="icon-preview">
                  <img src={icon.svgUrl} alt="" />
                </span>
                <span className="icon-name">{icon.displayName}</span>
                <span className="icon-library">{icon.libraryName}</span>
              </button>
            ))}
            {!loading && icons.length === 0 ? <p className="muted grid-empty">No icons found.</p> : null}
          </section>
        </>
      )}

      <footer className={error ? "status error" : "status"}>{error || status}</footer>
    </main>
  );
}

function svgToDataUrl(svg: string): string {
  const bytes = new TextEncoder().encode(svg);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:image/svg+xml;base64,${window.btoa(binary)}`;
}
