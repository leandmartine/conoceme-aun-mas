import type {
  AiChatRequest,
  AiChatResponse,
  AiStatusDto,
  ProfileDto,
} from '@conoceme/shared';
import type { Env } from '../../config/env.js';
import type { ProfileService } from '../profile/profile.service.js';
import { classifyIntent, SAFE_REPLIES } from './intent.js';
import type { FileKnowledgeRepository, KnowledgeBundle } from './knowledge.repository.js';

const SYSTEM_ROLE_NOTE =
  'Stub grounded companion — knowledge from content/ only (docs/AI_GUIDE.md).';

export class AiService {
  private knowledgeCache: KnowledgeBundle | null = null;
  private knowledgeLoadedAt = 0;

  constructor(
    private readonly env: Env,
    private readonly knowledge: FileKnowledgeRepository,
    private readonly profile: ProfileService,
  ) {}

  status(): AiStatusDto {
    const hasKeys = this.env.apiKeys.size > 0;
    const modelConfigured = Boolean(this.env.XAI_API_KEY);
    return {
      ok: true,
      enabled: hasKeys,
      mode: !hasKeys ? 'disabled' : modelConfigured ? 'llm' : 'stub',
      requiresApiKey: true,
      modelConfigured,
    };
  }

  async chat(input: AiChatRequest): Promise<AiChatResponse> {
    const message = (input.message ?? '').trim().slice(0, 2000);
    const intent = classifyIntent(message);

    if (intent.kind !== 'on_topic' && intent.reason) {
      return {
        reply: SAFE_REPLIES[intent.reason],
        meta: {
          grounded: false,
          refused: true,
          reason: intent.reason,
          mode: 'stub',
        },
      };
    }

    const kb = await this.getKnowledge();
    const profile = await this.profile.getProfile();

    // Optional LLM path later; v1 always uses grounded stub answers.
    // When XAI_API_KEY is present we still stub until provider wiring is approved.
    void this.env.XAI_API_KEY;
    void SYSTEM_ROLE_NOTE;

    const reply = this.composeStubReply(message, profile, kb, input);
    return {
      reply,
      meta: {
        grounded: true,
        refused: false,
        reason: null,
        mode: 'stub',
      },
    };
  }

  private async getKnowledge(): Promise<KnowledgeBundle> {
    const now = Date.now();
    if (this.knowledgeCache && now - this.knowledgeLoadedAt < 60_000) {
      return this.knowledgeCache;
    }
    this.knowledgeCache = await this.knowledge.load();
    this.knowledgeLoadedAt = now;
    return this.knowledgeCache;
  }

  private composeStubReply(
    message: string,
    profile: ProfileDto,
    kb: KnowledgeBundle,
    input: AiChatRequest,
  ): string {
    const lower = message.toLowerCase();
    const zone = input.player?.zoneId;
    const zoneHint = zone
      ? ` Ahora estás cerca de **${zone}** en el mapa.`
      : '';

    if (/contacto|email|mail|tel[eé]fono|linkedin|llamar|escrib/i.test(lower)) {
      const email = profile.socials.email ?? 'leandromartinez38@gmail.com';
      const linkedin = profile.socials.linkedin ?? '';
      const phone = profile.phone ?? '';
      return [
        `Podés contactar a **${profile.displayName ?? profile.name}** por:`,
        email ? `- Email: ${email}` : null,
        phone ? `- Tel: ${phone}` : null,
        linkedin ? `- LinkedIn: ${linkedin}` : null,
        profile.socials.github ? `- GitHub: ${profile.socials.github}` : null,
        '',
        'En el mapa, el **Faro** es el capítulo de contacto.',
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (/github|repositorio|repos|c[oó]digo|puerto/i.test(lower)) {
      const gh = profile.socials.github ?? 'https://github.com/leandmartine';
      return `El código público de Leandro está en GitHub: ${gh}. En el mapa, el **Puerto** representa ese capítulo (colaboraciones y proyectos en repos).${zoneHint}`;
    }

    if (
      /estudi|universidad|ort|educaci|carrera|analista/i.test(lower)
    ) {
      const edu = profile.education
        .map((e) => {
          const bits = [e.institution, e.focus, e.status, e.year]
            .filter(Boolean)
            .join(' · ');
          return `- ${bits}`;
        })
        .join('\n');
      return `Estudios de **${profile.name}**:\n${edu || '- Ver perfil en el portfolio'}\n\nEn el mapa, la zona **Universidad** cuenta esa historia.${zoneHint}`;
    }

    if (
      /experiencia|trabaj|mercado\s*libre|scotiabank|santander|ine|fraude|empleo|laboral/i.test(
        lower,
      )
    ) {
      const lines = profile.experience
        .slice(0, 4)
        .map((e) => {
          const period = e.period ? ` (${e.period})` : '';
          const hi = e.highlights?.[0] ? ` — ${e.highlights[0]}` : '';
          return `- **${e.organization}** · ${e.role}${period}${hi}`;
        })
        .join('\n');
      return `Trayectoria pública (sin inventar nada fuera del portfolio):\n${lines}\n\n**Ciudad Vieja** en el mapa es el capítulo de experiencia laboral.${zoneHint}`;
    }

    if (/skill|tecnolog|stack|html|css|javascript|sql|c#|azure|aws/i.test(lower)) {
      const skills = profile.skills.slice(0, 12).join(', ');
      return `Skills que declara el portfolio: ${skills}. Idiomas: ${(profile.languages ?? [])
        .map((l) => `${l.name} (${l.level})`)
        .join(', ') || 'ver perfil'}.${zoneHint}`;
    }

    if (
      /mapa|br[uú]jula|zona|lugar|rambla|ciudad|skyline|campo|faro|c[oó]mo\s+(juego|camino|muevo)|control/i.test(
        lower,
      )
    ) {
      const mapSection = kb.sections.find((s) => s.id === 'map');
      const body =
        mapSection?.body
          .replace(/^#.+\n/, '')
          .trim()
          .slice(0, 700) ??
        'Todos los lugares están abiertos. WASD para moverte, E para interactuar, Shift para correr. La brújula apunta a cada capítulo.';
      return `${body}${zoneHint}`;
    }

    if (/qui[eé]n\s+es|present|about|sobre\s+(vos|leandro|él|el)|tagline|conoceme/i.test(lower)) {
      return [
        `**${profile.displayName ?? profile.name}** — ${profile.headline}.`,
        profile.location,
        '',
        profile.summary,
        '',
        `Tagline: “${profile.tagline}”.`,
        'Empezá en la **Rambla**; desde ahí la brújula te lleva al resto del Uruguay del portfolio.',
        zoneHint.trim(),
      ]
        .filter(Boolean)
        .join('\n');
    }

    if (/proyecto|skyline|portfolio\s+web/i.test(lower)) {
      return `El **Skyline** es el capítulo de proyectos. Si hay detalle fino de cada repo, vive en el panel del lugar y en GitHub (${profile.socials.github ?? 'github.com/leandmartine'}). No invento proyectos que no estén en el content.${zoneHint}`;
    }

    // Default grounded intro + soft redirect
    return [
      `Soy el compañero de **conoceme-aun-mas**. Puedo hablar de **${profile.displayName ?? profile.name}** (experiencia, estudios, skills, contacto) y del mapa (Rambla, brújula, zonas).`,
      zoneHint.trim(),
      '',
      'Probá preguntar: “¿Dónde trabajó?”, “¿Qué estudia?”, “¿Cómo lo contacto?” o “¿Qué hay en el Puerto?”.',
    ]
      .filter(Boolean)
      .join('\n');
  }
}
