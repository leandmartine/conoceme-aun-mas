import type { PlaceId } from '@conoceme/shared';

const KEY = 'conoceme-visited-places';

export function loadVisited(): Set<PlaceId> {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(arr as PlaceId[]);
  } catch {
    return new Set();
  }
}

export function saveVisited(visited: Set<PlaceId>): void {
  try {
    localStorage.setItem(KEY, JSON.stringify([...visited]));
  } catch {
    /* ignore */
  }
}

export function markVisited(id: PlaceId): Set<PlaceId> {
  const next = loadVisited();
  next.add(id);
  saveVisited(next);
  return next;
}
