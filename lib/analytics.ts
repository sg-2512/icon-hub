/**
 * Analytics module — hybrid tracking with Google Analytics (GA4) + Supabase.
 *
 * GA4:  fires `gtag` events for real-time dashboards.
 * Supabase: inserts rows into `search_logs` / `export_logs` for structured queries.
 *
 * Both paths are fire-and-forget and never throw to the caller.
 */

import { createClient, isSupabaseConfigured } from './supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchEvent {
  query: string
  library: string
  category: string
  style: string
  sort: string
  legalOnly: boolean
  resultCount: number
}

export interface ExportEvent {
  /** 'zip' | 'json' | 'react' | 'vue' | 'tailwind' | 'csv' */
  format: string
  iconCount: number
  /** Comma-separated list of libraries present in the export */
  libraries: string
  /** Comma-separated list of icon names */
  iconNames: string
}

export interface AddToCartEvent {
  iconId: string
  iconName: string
  library: string
}

export interface CartImportEvent {
  source: 'shared_url'
  iconCount: number
  libraries: string
}

type GtagWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Queue a GA event even if the external script is still loading. */
function fireGtagEvent(eventName: string, params: Record<string, unknown>) {
  try {
    if (typeof window === 'undefined') return

    const analyticsWindow = window as GtagWindow
    analyticsWindow.dataLayer = analyticsWindow.dataLayer || []
    analyticsWindow.gtag = analyticsWindow.gtag || ((...args: unknown[]) => {
      analyticsWindow.dataLayer?.push(args)
    })
    analyticsWindow.gtag('event', eventName, params)
  } catch {
    // silently swallow — analytics should never break the app
  }
}

/** Get a stable anonymous session ID (persisted in localStorage). */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'ssr'
  const KEY = 'iconhub_session_id'
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    localStorage.setItem(KEY, id)
  }
  return id
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Track a search event.
 * Debounced by the caller (fires once the API response arrives).
 */
export async function trackSearch(event: SearchEvent) {
  // GA4
  fireGtagEvent('icon_search', {
    search_term: event.query,
    library: event.library,
    category: event.category,
    style: event.style,
    sort: event.sort,
    legal_only: event.legalOnly,
    result_count: event.resultCount,
  })

  // Supabase (fire-and-forget)
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      if (supabase) {
        await supabase.from('search_logs').insert({
          session_id: getSessionId(),
          query: event.query.slice(0, 200), // cap at 200 chars
          library: event.library,
          category: event.category,
          style: event.style,
          sort_by: event.sort,
          legal_only: event.legalOnly,
          result_count: event.resultCount,
        })
      }
    } catch {
      // silently swallow
    }
  }
}

/**
 * Track an icon being added to the cart.
 */
export async function trackAddToCart(event: AddToCartEvent) {
  fireGtagEvent('add_to_cart', {
    items: [{
      item_id: event.iconId,
      item_name: event.iconName,
      item_category: event.library,
      quantity: 1,
    }],
  })
}

/**
 * Track a cart restored from an external/shared source.
 */
export function trackCartImport(event: CartImportEvent) {
  const libraries = event.libraries.split(',').filter(Boolean)
  fireGtagEvent('cart_import', {
    import_source: event.source,
    icon_count: event.iconCount,
    library_count: libraries.length,
    primary_library: libraries[0] || 'unknown',
  })
}

/**
 * Track a ZIP or code-format export.
 */
export async function trackExport(event: ExportEvent) {
  const libraries = event.libraries.split(',').filter(Boolean)

  // GA4
  fireGtagEvent('icon_export', {
    export_format: event.format,
    icon_count: event.iconCount,
    library_count: libraries.length,
    primary_library: libraries[0] || 'unknown',
  })

  // Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient()
      if (supabase) {
        await supabase.from('export_logs').insert({
          session_id: getSessionId(),
          format: event.format,
          icon_count: event.iconCount,
          libraries: event.libraries,
          icon_names: event.iconNames.slice(0, 5000), // cap field size
        })
      }
    } catch {
      // silently swallow
    }
  }
}
