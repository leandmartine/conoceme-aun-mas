import type { PlaceId, PlaceSummaryDto } from '@conoceme/shared';

/** Scale abstract content coords → world pixels. */
export const WORLD_SCALE = 10;
export const WORLD_PADDING = 480;
export const WORLD_SIZE = 2400;

export interface WorldPoi {
  id: PlaceId;
  title: string;
  subtitle: string;
  compassLabel: string;
  x: number;
  y: number;
  color: number;
}

const ZONE_COLORS: Record<PlaceId, number> = {
  rambla: 0x1b4f72,
  'ciudad-vieja': 0xc4a574,
  skyline: 0x5a6d8a,
  universidad: 0x4a7c59,
  puerto: 0x2c5f7c,
  campo: 0x6b8f4e,
  faro: 0xe07a5f,
};

export function contentToWorld(mapX: number, mapY: number): { x: number; y: number } {
  // content y grows south in our ascii map; Phaser y also grows down
  return {
    x: WORLD_SIZE / 2 + mapX * WORLD_SCALE,
    y: WORLD_SIZE / 2 + mapY * WORLD_SCALE,
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
  if (!spawn) return { x: WORLD_SIZE / 2, y: WORLD_SIZE / 2 + 200 };
  return contentToWorld(spawn.map.x, spawn.map.y);
}
