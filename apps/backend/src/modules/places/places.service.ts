import type { PlaceDetailDto, PlaceId, PlacesIndexDto } from '@conoceme/shared';
import type { IPlacesRepository } from './places.repository.js';

export class PlacesService {
  constructor(private readonly repo: IPlacesRepository) {}

  listPlaces(): Promise<PlacesIndexDto> {
    return this.repo.listPlaces();
  }

  getPlace(id: PlaceId): Promise<PlaceDetailDto> {
    return this.repo.getPlace(id);
  }
}
