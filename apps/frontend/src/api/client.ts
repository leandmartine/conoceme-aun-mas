import type {
  ApiErrorBody,
  HealthDto,
  PlaceDetailDto,
  PlaceId,
  PlacesIndexDto,
  PlayerStateDto,
  ProfileDto,
} from '@conoceme/shared';
import { API_V1_PREFIX } from '@conoceme/shared';

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_V1_PREFIX}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!res.ok) {
    let code = 'HTTP_ERROR';
    let message = res.statusText;
    try {
      const body = (await res.json()) as ApiErrorBody;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      /* ignore parse errors */
    }
    throw new ApiClientError(code, message, res.status);
  }

  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<HealthDto>('/health'),
  profile: () => request<ProfileDto>('/profile'),
  places: () => request<PlacesIndexDto>('/places'),
  place: (id: PlaceId) => request<PlaceDetailDto>(`/places/${id}`),
  playerState: () => request<PlayerStateDto>('/player/state'),
  putPlayerState: (state: Omit<PlayerStateDto, 'updatedAt'>) =>
    request<PlayerStateDto>('/player/state', {
      method: 'PUT',
      body: JSON.stringify(state),
    }),
};
