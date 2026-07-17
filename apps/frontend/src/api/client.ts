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

/**
 * Companion key resolution:
 * 1) VITE_PORTFOLIO_API_KEY (local dev)
 * 2) GET /ai/status → publicClientKey (prod Railway, no rebuild)
 */
let runtimeCompanionKey: string | null | undefined;

function envCompanionKey(): string {
  return (import.meta.env.VITE_PORTFOLIO_API_KEY as string | undefined)?.trim() || '';
}

async function resolveCompanionKey(): Promise<string> {
  const fromEnv = envCompanionKey();
  if (fromEnv) return fromEnv;
  if (runtimeCompanionKey !== undefined) return runtimeCompanionKey ?? '';
  try {
    const status = await request<AiStatusDto>('/ai/status');
    runtimeCompanionKey = status.publicClientKey?.trim() || null;
  } catch {
    runtimeCompanionKey = null;
  }
  return runtimeCompanionKey ?? '';
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
    const key = await resolveCompanionKey();
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
  aiChat: async (body: AiChatRequest) =>
    request<AiChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(body),
      withApiKey: true,
    }),
};
