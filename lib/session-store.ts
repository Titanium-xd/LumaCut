/**
 * lib/session-store.ts
 *
 * IndexedDB persistence layer via localforage.
 * Uses a dedicated store instance so it doesn't collide with any other
 * localforage usage in the app. Dynamically imported for SSR safety.
 */

export interface SessionEntry {
  id: string
  fileName: string
  /** Input image as base64 data-URL */
  inputDataUrl: string
  /** Output transparent PNG as base64 data-URL */
  outputDataUrl: string
  /** Unix timestamp (ms) of when the cut was completed */
  timestamp: number
}

// Module-level lazy singleton — created once on first use
let _store: any = null

async function getStore(): Promise<any> {
  if (_store) return _store
  const { default: localforage } = await import('localforage')
  _store = localforage.createInstance({
    name: 'lumacut',
    storeName: 'sessions',
    description: 'LumaCut background-removal session history',
  })
  return _store
}

/** Persist a completed session entry to IndexedDB. */
export async function saveSession(entry: SessionEntry): Promise<void> {
  const store = await getStore()
  await store.setItem(entry.id, entry)
}

/**
 * Load all sessions from IndexedDB, sorted newest-first.
 * Returns at most 20 entries to keep the history card manageable.
 */
export async function loadSessions(): Promise<SessionEntry[]> {
  const store = await getStore()
  const sessions: SessionEntry[] = []
  await store.iterate((value: SessionEntry) => {
    sessions.push(value)
  })
  return sessions
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
}
