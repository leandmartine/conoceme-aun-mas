/** Shared REST contracts — used by frontend and backend. */

export type PlaceId =
  | 'rambla'
  | 'ciudad-vieja'
  | 'skyline'
  | 'universidad'
  | 'puerto'
  | 'campo'
  | 'faro';

export type PlaceChapter =
  | 'about'
  | 'experience'
  | 'projects'
  | 'education'
  | 'github'
  | 'values'
  | 'contact';

export interface SocialLinks {
  github: string | null;
  linkedin: string | null;
  email: string | null;
  website?: string | null;
}

export interface ProfileDto {
  name: string;
  headline: string;
  location: string;
  tagline: string;
  summary: string;
  skills: string[];
  socials: SocialLinks;
  education: Array<{
    institution: string;
    focus?: string;
    notes?: string;
  }>;
  experience: Array<{
    organization: string;
    role: string;
    highlights: string[];
    notes?: string;
  }>;
  characterArt: {
    inspiredBy: string;
    notIdentical: boolean;
    build: string;
    skin: string;
    eyes: string;
    hair: string;
  };
}

export interface PlaceMapCoords {
  x: number;
  y: number;
}

export interface PlaceSummaryDto {
  id: PlaceId;
  title: string;
  chapter: PlaceChapter;
  subtitle?: string;
  map: PlaceMapCoords;
  compassLabel: string;
}

export interface PlaceDetailDto extends PlaceSummaryDto {
  bodyMarkdown: string;
  links: Array<{
    label: string;
    href: string;
    kind: 'github' | 'web' | 'linkedin' | 'email' | 'other';
  }>;
}

export interface PlacesIndexDto {
  allUnlockedFromStart: boolean;
  spawnPlaceId: PlaceId;
  places: PlaceSummaryDto[];
}

export interface PlayerStateDto {
  zoneId: PlaceId | null;
  position: { x: number; y: number };
  visitedPlaceIds: PlaceId[];
  focusedPlaceId: PlaceId | null;
  updatedAt: string;
}

export interface HealthDto {
  ok: true;
  service: 'conoceme-backend';
  version: string;
  timestamp: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export const API_V1_PREFIX = '/api/v1' as const;
