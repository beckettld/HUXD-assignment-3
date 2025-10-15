import { GoogleGenAI } from '@google/genai';

export function hasGemini(apiKey) {
    return Boolean(apiKey && apiKey.trim().length > 0);
}

export async function geminiGenerate({ contents, systemPrompt = '', config = {}, apiKey }) {
    if (!apiKey || !apiKey.trim()) {
        throw new Error('Gemini API key is required');
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    if (systemPrompt) {
        config.systemInstruction = { role: 'model', parts: [{ text: systemPrompt }] };
    }

    const request = {
        model: 'gemini-2.5-flash',
        contents: contents,
        config: config
    };

    const response = await ai.models.generateContent(request);
    const text = typeof response?.text === 'string' ? response.text : '';
    return { text, raw: response };
}


