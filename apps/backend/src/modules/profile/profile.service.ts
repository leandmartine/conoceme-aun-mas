import type { ProfileDto } from '@conoceme/shared';
import type { IProfileRepository } from './profile.repository.js';

export class ProfileService {
  constructor(private readonly repo: IProfileRepository) {}

  getProfile(): Promise<ProfileDto> {
    return this.repo.getProfile();
  }
}
