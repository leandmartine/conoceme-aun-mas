import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  PlaceDetailDto,
  PlaceId,
  PlacesIndexDto,
  PlaceSummaryDto,
} from '@conoceme/shared';
import { NotFoundError } from '../../shared/errors.js';

export interface IPlacesRepository {
  listPlaces(): Promise<PlacesIndexDto>;
  getPlace(id: PlaceId): Promise<PlaceDetailDto>;
}

interface PlacesIndexFile {
  allUnlockedFromStart: boolean;
  spawnPlaceId: PlaceId;
  places: PlaceSummaryDto[];
}

export class FilePlacesRepository implements IPlacesRepository {
  constructor(private readonly contentRoot: string) {}

  async listPlaces(): Promise<PlacesIndexDto> {
    const index = await this.readIndex();
    return {
      allUnlockedFromStart: index.allUnlockedFromStart,
      spawnPlaceId: index.spawnPlaceId,
      places: index.places,
    };
  }

  async getPlace(id: PlaceId): Promise<PlaceDetailDto> {
    const index = await this.readIndex();
    const summary = index.places.find((p) => p.id === id);
    if (!summary) {
      throw new NotFoundError('PLACE_NOT_FOUND', `Place "${id}" does not exist`);
    }

    const mdPath = path.join(this.contentRoot, 'places', `${id}.md`);
    let bodyMarkdown: string;
    try {
      bodyMarkdown = await readFile(mdPath, 'utf8');
    } catch {
      throw new NotFoundError(
        'PLACE_CONTENT_MISSING',
        `Content file for place "${id}" is missing`,
      );
    }

    return {
      ...summary,
      bodyMarkdown,
      links: extractLinks(bodyMarkdown),
    };
  }

  private async readIndex(): Promise<PlacesIndexFile> {
    const filePath = path.join(this.contentRoot, 'places.index.json');
    const raw = await readFile(filePath, 'utf8');
    return JSON.parse(raw) as PlacesIndexFile;
  }
}

/** Pull markdown links as a convenience for the UI. */
function extractLinks(
  markdown: string,
): PlaceDetailDto['links'] {
  const links: PlaceDetailDto['links'] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+|mailto:[^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown)) !== null) {
    const label = match[1] ?? '';
    const href = match[2] ?? '';
    links.push({ label, href, kind: classifyLink(href) });
  }
  // Also bare emails / urls in "Email: x" lines
  const emailLine = markdown.match(/Email:\s*(\S+@\S+)/i);
  if (emailLine?.[1] && !links.some((l) => l.href.includes(emailLine[1]!))) {
    links.push({
      label: 'Email',
      href: `mailto:${emailLine[1]}`,
      kind: 'email',
    });
  }
  return links;
}

function classifyLink(href: string): PlaceDetailDto['links'][number]['kind'] {
  if (href.startsWith('mailto:') || href.includes('@') && !href.startsWith('http')) {
    return 'email';
  }
  if (href.includes('github.com')) return 'github';
  if (href.includes('linkedin.com')) return 'linkedin';
  return 'web';
}
