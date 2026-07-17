import type {
  AiChatRequest,
  AiChatResponse,
  AiStatusDto,
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

/** Portfolio AI key — only for local/demo companion; never put real secrets in VITE_*. */
function portfolioApiKey(): string {
  return (import.meta.env.VITE_PORTFOLIO_API_KEY as string | undefined)?.trim() || '';
}

async function request<T>(
  path: string,
  init?: RequestInit & { withApiKey?: boolean },
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  if (init?.withApiKey) {
    const key = portfolioApiKey();
    if (key) headers['Authorization'] = `Bearer ${key}`;
  }

  const res = await fetch(`${API_V1_PREFIX}${path}`, {
    ...init,
    headers,
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
  aiStatus: () => request<AiStatusDto>('/ai/status'),
  aiChat: (body: AiChatRequest) =>
    request<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      withApiKey: true,
    }),
};
