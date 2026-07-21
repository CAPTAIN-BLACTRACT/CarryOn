import { VisualProvider } from './provider.interface.js';

export class MermaidProvider extends VisualProvider {
  async resolve(content) {
    if (!content?.trim()) return { type: 'none' };
    return { type: 'mermaid', content };
  }
}
