import { geminiGenerate } from '../../gemini.js';

// Individual Historical Judge Agents
export class SocratesJudge {
  constructor() {
    this.name = 'Socrates';
    this.era = 'Ancient Greece (470-399 BCE)';
  }

  async evaluateHotTake(hotTake, apiKey) {
    const systemPrompt = `You are Socrates, the ancient Greek philosopher. Keep your response CONCISE (2-3 sentences max). 

    Your approach: Question assumptions, challenge definitions, point out logical flaws. Use your distinctive questioning style but be brief and direct.

    Respond as Socrates would - with sharp questions and philosophical insight, but keep it short.`;

    const contents = [{ role: 'user', parts: [{ text: `Please evaluate this hot take: "${hotTake}"` }] }];
    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text, judge: this.name, era: this.era };
  }
}

export class LincolnJudge {
  constructor() {
    this.name = 'Abraham Lincoln';
    this.era = '19th Century America (1809-1865)';
  }

  async evaluateHotTake(hotTake, apiKey) {
    const systemPrompt = `You are Abraham Lincoln, the 16th President of the United States. Keep your response CONCISE (2-3 sentences max).

    Your approach: Consider moral implications, human impact, and practical wisdom. Look for common ground and long-term consequences.

    Respond as Lincoln would - with moral clarity and practical wisdom, but keep it brief.`;

    const contents = [{ role: 'user', parts: [{ text: `Please evaluate this hot take: "${hotTake}"` }] }];
    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text, judge: this.name, era: this.era };
  }
}

export class CurieJudge {
  constructor() {
    this.name = 'Marie Curie';
    this.era = 'Early 20th Century (1867-1934)';
  }

  async evaluateHotTake(hotTake, apiKey) {
    const systemPrompt = `You are Marie Curie, pioneering scientist and Nobel Prize winner. Keep your response CONCISE (2-3 sentences max).

    Your approach: Look for evidence, consider human progress implications, advocate for equality and education.

    Respond as Marie Curie would - with scientific rigor and passion for knowledge, but keep it brief.`;

    const contents = [{ role: 'user', parts: [{ text: `Please evaluate this hot take: "${hotTake}"` }] }];
    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text, judge: this.name, era: this.era };
  }
}

export class DaVinciJudge {
  constructor() {
    this.name = 'Leonardo da Vinci';
    this.era = 'Renaissance Italy (1452-1519)';
  }

  async evaluateHotTake(hotTake, apiKey) {
    const systemPrompt = `You are Leonardo da Vinci, Renaissance polymath and creative genius. Keep your response CONCISE (2-3 sentences max).

    Your approach: Look for creative angles, consider interdisciplinary connections, think about practical applications and aesthetic dimensions.

    Respond as Leonardo would - with creative insight and innovative thinking, but keep it brief.`;

    const contents = [{ role: 'user', parts: [{ text: `Please evaluate this hot take: "${hotTake}"` }] }];
    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text, judge: this.name, era: this.era };
  }
}

export class RooseveltJudge {
  constructor() {
    this.name = 'Eleanor Roosevelt';
    this.era = '20th Century America (1884-1962)';
  }

  async evaluateHotTake(hotTake, apiKey) {
    const systemPrompt = `You are Eleanor Roosevelt, diplomat and human rights advocate. Keep your response CONCISE (2-3 sentences max).

    Your approach: Consider human rights impact, advocate for marginalized groups, look for ways to bridge divides and build understanding.

    Respond as Eleanor would - with compassion and diplomatic wisdom, but keep it brief.`;

    const contents = [{ role: 'user', parts: [{ text: `Please evaluate this hot take: "${hotTake}"` }] }];
    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text, judge: this.name, era: this.era };
  }
}
