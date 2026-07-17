import type { AiRefuseReason } from '@conoceme/shared';

export type IntentKind =
  | 'on_topic'
  | 'off_topic'
  | 'jailbreak'
  | 'code_request'
  | 'exfil_prompt'
  | 'format_escape'
  | 'empty';

export function classifyIntent(message: string): {
  kind: IntentKind;
  reason: AiRefuseReason;
} {
  const text = message.trim();
  if (!text) {
    return { kind: 'empty', reason: 'EMPTY' };
  }

  const lower = text.toLowerCase();

  // Prompt exfil first (more specific than general jailbreak)
  if (
    /revel[aá].*(prompt|reglas|system)|print\s+your\s+instructions|what\s+are\s+your\s+rules|instrucciones\s*internas|show.*(system|hidden).*prompt/i.test(
      lower,
    )
  ) {
    return { kind: 'exfil_prompt', reason: 'EXFIL_PROMPT' };
  }

  // Jailbreak / role override
  if (
    /system\s*prompt|ignore\s+(all\s+)?(previous|prior|above)/i.test(text) ||
    /dan\s*mode|developer\s*mode|jailbreak|modo\s*dios|actúa como|actua como si no tuvieras reglas/i.test(
      lower,
    ) ||
    /ignor[aá]\s+(las\s+)?(reglas|instrucciones)|olvid[aá]\s+tus\s+instrucciones|bypass|unfiltered/i.test(
      lower,
    )
  ) {
    return { kind: 'jailbreak', reason: 'JAILBREAK' };
  }

  // Format escape
  if (
    /respond[eé]\s+(solo\s+)?en\s+(json|yaml|xml|csv)|only\s+(json|yaml)|output\s+(json|yaml)|como\s+si\s+fueras\s+un\s+compilador/i.test(
      lower,
    )
  ) {
    return { kind: 'format_escape', reason: 'FORMAT_ESCAPE' };
  }

  // Code request (generic programming help — not about Leandro's stack/projects)
  if (
    /(escrib[ií]|dame|pasame|pasáme|gener[aá]|implement[aá]).{0,40}(c[oó]digo|script|exploit|malware|for\s+en\s+python|función|function|class\s+\w+)/i.test(
      lower,
    ) ||
    /write\s+(me\s+)?(a\s+)?(python|javascript|bash|sql)\s+(script|code|program)/i.test(
      lower,
    ) ||
    /resolv[eé]\s+este\s+(ejercicio|problema\s+de\s+programaci)/i.test(lower)
  ) {
    return { kind: 'code_request', reason: 'CODE_REQUEST' };
  }

  // Clear off-topic recipes / homework unrelated
  if (
    /(receta|cocinar|clima\s+de\s+mañana|partido\s+de\s+fútbol|tarea\s+de\s+matem[aá]tica|diagn[oó]stico\s+m[eé]dico)/i.test(
      lower,
    )
  ) {
    return { kind: 'off_topic', reason: 'OFF_TOPIC' };
  }

  return { kind: 'on_topic', reason: null };
}

export const SAFE_REPLIES: Record<Exclude<AiRefuseReason, null>, string> = {
  OFF_TOPIC:
    'Estoy acá para contarte sobre Leandro y guiarte por el mapa del portfolio. Si querés, te digo qué representa cada zona o a dónde apunta la brújula 🧭',
  JAILBREAK:
    'No puedo cambiar de formato ni de rol. ¿Querés saber de su experiencia, estudios, proyectos o cómo contactarlo?',
  CODE_REQUEST:
    'Estoy acá para contarte sobre Leandro y guiarte por el mapa del portfolio. Si querés, te digo qué representa cada zona o a dónde apunta la brújula 🧭',
  EXFIL_PROMPT: 'No comparto instrucciones internas. ¿Seguimos con el portfolio?',
  FORMAT_ESCAPE:
    'No puedo cambiar de formato ni de rol. ¿Querés saber de su experiencia, estudios, proyectos o cómo contactarlo?',
  EMPTY: 'Decime algo sobre Leandro o el mapa (experiencia, estudios, GitHub, contacto…).',
  RATE_LIMIT: 'Demasiados mensajes. Esperá un momento y probá de nuevo.',
};
