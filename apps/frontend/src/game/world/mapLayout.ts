import type { PlaceId, PlaceSummaryDto } from '@conoceme/shared';

/** Compact world — places stay close so exploration feels tight. */
export const WORLD_SIZE = 1600;
const PAD = 180;

/** Content map bounds tuned to coastal cluster layout. */
const CX0 = -55;
const CX1 = 55;
const CY0 = -45;
const CY1 = 55;

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
  rambla: 0x2a6f97,
  'ciudad-vieja': 0xc4a574,
  skyline: 0x5b7c99,
  universidad: 0x4a7c59,
  puerto: 0x1b4f72,
  campo: 0x5d8f4e,
  faro: 0xe07a5f,
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
  if (!spawn) return { x: WORLD_SIZE / 2, y: WORLD_SIZE * 0.72 };
  return contentToWorld(spawn.map.x, spawn.map.y);
}

export function labelForPoi(poi: Pick<WorldPoi, 'title' | 'subtitle'>): string {
  return `${poi.title} — ${poi.subtitle}`;
}

/** Logical road graph — coastal city ring, not long diagonals across campo. */
export const ROAD_LINKS: Array<[PlaceId, PlaceId]> = [
  ['rambla', 'ciudad-vieja'],
  ['rambla', 'puerto'],
  ['rambla', 'faro'],
  ['ciudad-vieja', 'puerto'],
  ['ciudad-vieja', 'skyline'],
  ['skyline', 'universidad'],
  ['universidad', 'campo'],
  ['campo', 'ciudad-vieja'],
  ['skyline', 'faro'],
];
