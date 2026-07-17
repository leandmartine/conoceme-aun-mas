import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export interface KnowledgeBundle {
  sections: Array<{ id: string; title: string; body: string }>;
  flatText: string;
}

export class FileKnowledgeRepository {
  constructor(private readonly contentRoot: string) {}

  async load(): Promise<KnowledgeBundle> {
    const dir = path.join(this.contentRoot, 'knowledge');
    const sections: KnowledgeBundle['sections'] = [];

    try {
      const files = (await readdir(dir))
        .filter((f) => f.endsWith('.md'))
        .sort();
      for (const file of files) {
        const body = await readFile(path.join(dir, file), 'utf8');
        const id = file.replace(/\.md$/i, '');
        const title =
          body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id;
        sections.push({ id, title, body });
      }
    } catch {
      /* knowledge optional at boot; service still works with profile facts */
    }

    // Always include profile.json as a section if present
    try {
      const profileRaw = await readFile(
        path.join(this.contentRoot, 'profile.json'),
        'utf8',
      );
      sections.push({
        id: 'profile',
        title: 'Profile JSON',
        body: profileRaw,
      });
    } catch {
      /* ignore */
    }

    const flatText = sections.map((s) => s.body).join('\n\n---\n\n');
    return { sections, flatText };
  }
}
