import type Phaser from 'phaser';
import type { PlaceId } from '@conoceme/shared';
import { ROAD_LINKS, type WorldPoi } from './mapLayout';

type Pt = { x: number; y: number };

/**
 * Winding roads: shoulder + asphalt + soft center dashes.
 * Curves hug “blocks” instead of cutting straight through biomes.
 */
export function drawWindingRoads(
  g: Phaser.GameObjects.Graphics,
  pois: WorldPoi[],
): void {
  const byId = new Map(pois.map((p) => [p.id, p]));

  for (const [a, b] of ROAD_LINKS) {
    const pa = byId.get(a);
    const pb = byId.get(b);
    if (!pa || !pb) continue;
    const path = buildPath(pa, pb, a, b);
    strokePath(g, path, 28, 0x6b5344, 0.35); // dirt shoulder
    strokePath(g, path, 18, 0x4a5058, 0.92); // asphalt
    strokePath(g, path, 3, 0xf4c430, 0.28); // center
  }
}

function buildPath(
  a: WorldPoi,
  b: WorldPoi,
  idA: PlaceId,
  idB: PlaceId,
): Pt[] {
  const mid = curveControl(a, b, idA, idB);
  // sample quadratic Bezier
  const pts: Pt[] = [];
  const steps = 18;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pts.push(quad(a, mid, b, t));
  }
  return pts;
}

/**
 * Control point rules so roads feel geographic:
 * coastal links bow south toward water; inland bow north; port hugs west bay.
 */
function curveControl(
  a: WorldPoi,
  b: WorldPoi,
  idA: PlaceId,
  idB: PlaceId,
): Pt {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular
  let px = -dy / len;
  let py = dx / len;

  const pair = new Set([idA, idB]);
  let bend = 0.22 * len;

  if (pair.has('puerto')) {
    // hug water / west
    px = -1;
    py = 0.15;
    bend = 0.28 * len;
  } else if (pair.has('faro') && pair.has('rambla')) {
    // along the coast east
    px = 0.2;
    py = 1;
    bend = 0.2 * len;
  } else if (pair.has('faro') && pair.has('skyline')) {
    px = 0.85;
    py = 0.35;
    bend = 0.25 * len;
  } else if (pair.has('campo') || pair.has('universidad')) {
    // rural: gentle north meander
    px = 0.1;
    py = -1;
    bend = 0.3 * len;
  } else if (pair.has('rambla')) {
    // approach promenade from north with S-curve feel
    px = dx > 0 ? -0.4 : 0.4;
    py = 0.9;
    bend = 0.24 * len;
  } else {
    // city grid-ish: slight offset so not ruler-straight
    bend = 0.14 * len;
  }

  return { x: mx + px * bend, y: my + py * bend };
}

function quad(p0: Pt, p1: Pt, p2: Pt, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

function strokePath(
  g: Phaser.GameObjects.Graphics,
  path: Pt[],
  width: number,
  color: number,
  alpha: number,
): void {
  if (path.length < 2) return;
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(path[0]!.x, path[0]!.y);
  for (let i = 1; i < path.length; i++) {
    g.lineTo(path[i]!.x, path[i]!.y);
  }
  g.strokePath();
}
