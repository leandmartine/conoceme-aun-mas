import type { PlaceId, PlaceSummaryDto } from '@conoceme/shared';

export const WORLD_SIZE = 2400;
const PAD = 300;

/** Content map bounds (from places.index.json). */
const CX0 = -120;
const CX1 = 130;
const CY0 = -100;
const CY1 = 140;

export interface WorldPoi {
  id: PlaceId;
  title: string;
  subtitle: string;
  compassLabel: string;
  x: number;
  y: number;
  color: number;
}

/** Palette aligned with Uruguay biomes + design tokens. */
const ZONE_COLORS: Record<PlaceId, number> = {
  rambla: 0x2a6f97, // río / costa
  'ciudad-vieja': 0xc4a574, // piedra colonial
  skyline: 0x5b7c99, // vidrio urbano
  universidad: 0x4a7c59, // campus
  puerto: 0x1b4f72, // muelle / agua profunda
  campo: 0x5d8f4e, // pastura
  faro: 0xe07a5f, // faro / atardecer
};

export function contentToWorld(mapX: number, mapY: number): { x: number; y: number } {
  const nx = (mapX - CX0) / (CX1 - CX0);
  const ny = (mapY - CY0) / (CY1 - CY0);
  return {
    x: PAD + nx * (WORLD_SIZE - PAD * 2),
    y: PAD + ny * (WORLD_SIZE - PAD * 2),
  };
}

export function placesToPois(places: PlaceSummaryDto[]): WorldPoi[] {
  return places.map((p) => {
    const { x, y } = contentToWorld(p.map.x, p.map.y);
    return {
      id: p.id,
      title: p.title,
      subtitle: p.subtitle ?? p.chapter,
      compassLabel: p.compassLabel,
      x,
      y,
      color: ZONE_COLORS[p.id] ?? 0x7eb6d9,
    };
  });
}

export function spawnFromPlaces(
  places: PlaceSummaryDto[],
  spawnId: PlaceId,
): { x: number; y: number } {
  const spawn = places.find((p) => p.id === spawnId) ?? places[0];
  if (!spawn) return { x: WORLD_SIZE / 2, y: WORLD_SIZE * 0.7 };
  return contentToWorld(spawn.map.x, spawn.map.y);
}

export function labelForPoi(poi: Pick<WorldPoi, 'title' | 'subtitle'>): string {
  return `${poi.title} — ${poi.subtitle}`;
}
