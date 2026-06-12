type CacheStorage = 'memory' | 'localStorage'

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

interface CacheOptions {
  ttlMs: number
  storage?: CacheStorage
  force?: boolean
}

const PREFIX = 'bakevault:cache:'
const memoryCache = new Map<string, CacheEntry<unknown>>()

export const CACHE_TTL = {
  categories: 15 * 60 * 1000,
  products: 2 * 60 * 1000,
  testimonials: 15 * 60 * 1000,
  settings: 5 * 60 * 1000,
  faqs: 15 * 60 * 1000,
  aiChat: 7 * 24 * 60 * 60 * 1000,
} as const

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function fullKey(key: string): string {
  return `${PREFIX}${key}`
}

function readStorage<T>(key: string): CacheEntry<T> | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.localStorage.getItem(fullKey(key))
    if (!raw) return null
    return JSON.parse(raw) as CacheEntry<T>
  } catch {
    return null
  }
}

function writeStorage<T>(key: string, entry: CacheEntry<T>): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.setItem(fullKey(key), JSON.stringify(entry))
  } catch {
    // Storage may be full or unavailable. Memory cache still works.
  }
}

function isFresh<T>(entry: CacheEntry<T> | null | undefined): entry is CacheEntry<T> {
  return !!entry && entry.expiresAt > Date.now()
}

export function getClientCache<T>(key: string): T | null {
  const memoryEntry = memoryCache.get(key) as CacheEntry<T> | undefined
  if (isFresh(memoryEntry)) return memoryEntry.value
  if (memoryEntry) memoryCache.delete(key)

  const storageEntry = readStorage<T>(key)
  if (isFresh(storageEntry)) {
    memoryCache.set(key, storageEntry)
    return storageEntry.value
  }

  return null
}

export function setClientCache<T>(
  key: string,
  value: T,
  options: Pick<CacheOptions, 'ttlMs' | 'storage'>,
): void {
  const entry: CacheEntry<T> = {
    value,
    expiresAt: Date.now() + options.ttlMs,
  }

  memoryCache.set(key, entry)
  if (options.storage === 'localStorage') writeStorage(key, entry)
}

export async function getOrSetClientCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions,
): Promise<T> {
  if (!options.force) {
    const cached = getClientCache<T>(key)
    if (cached !== null) return cached
  }

  const value = await fetcher()
  setClientCache(key, value, options)
  return value
}

export function invalidateClientCache(prefix = ''): void {
  for (const key of [...memoryCache.keys()]) {
    if (!prefix || key.startsWith(prefix)) memoryCache.delete(key)
  }

  if (!canUseStorage()) return
  try {
    const storagePrefix = fullKey(prefix)
    for (let i = window.localStorage.length - 1; i >= 0; i -= 1) {
      const key = window.localStorage.key(i)
      if (key?.startsWith(storagePrefix)) window.localStorage.removeItem(key)
    }
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function stableSerialize(value: unknown): string {
  if (typeof value === 'undefined') return 'undefined'
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`

  const record = value as Record<string, unknown>
  return `{${Object.keys(record)
    .sort()
    .map(key => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`
}

export function hashString(value: string): string {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36)
}
