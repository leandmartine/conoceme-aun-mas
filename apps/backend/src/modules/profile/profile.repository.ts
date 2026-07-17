import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { ProfileDto } from '@conoceme/shared';

export interface IProfileRepository {
  getProfile(): Promise<ProfileDto>;
}

/** Reads profile from versioned /content (file adapter — swappable for DB later). */
export class FileProfileRepository implements IProfileRepository {
  constructor(private readonly contentRoot: string) {}

  async getProfile(): Promise<ProfileDto> {
    const filePath = path.join(this.contentRoot, 'profile.json');
    const raw = await readFile(filePath, 'utf8');
    const data = JSON.parse(raw) as ProfileDto;
    return data;
  }
}
