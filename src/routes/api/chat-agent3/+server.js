import { json } from '@sveltejs/kit';
import { getAgent3Instance } from '../../../lib/agents/agent3/Agent3.js';

/**
 * Handle chat POST requests for Agent3 - Riddle Realms Game System.
 * Supports interactive fantasy adventure with riddle solving.
 */
export async function POST({ request }) {
  const body = await request.json();
  const { history, apiKey } = body || {};

  if (!Array.isArray(history)) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    const agent = getAgent3Instance();
    
    console.log('Agent3 Riddle Realms API: Received request');
    console.log('History:', history);
    
    // Convert history to contents format
    const contents = history.map((m) => ({ 
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));
    
    const response = await agent.respond(contents, apiKey);
    
    console.log('Agent3 Riddle Realms API: Response generated');
    console.log('Response:', response);
    console.log('Response text:', response.text);
    
    if (!response.text) {
      console.error('No response text generated');
      return json({ error: 'No response generated' }, { status: 500 });
    }
    
    return json({ 
      assistantMessage: response.text, 
      replierInput: { 
        frameSet: { frames: { persona: { value: 'riddle_realms' } } }, 
        contextCount: history.length, 
        agent: 'agent3', 
        reasons: 'Riddle Realms game interaction' 
      } 
    });
  } catch (err) {
    console.error('Agent3 Riddle Realms API Error:', err);
    
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }
    return json({ error: 'Riddle Realms pipeline error', details: String(err?.message || err) }, { status: 500 });
  }
}

export async function GET() {
  return json({ 
    message: 'Riddle Realms API is running!',
    description: 'This is the API endpoint for the Riddle Realms interactive fantasy game.',
    version: '1.0.0',
    features: [
      'Interactive fantasy world exploration',
      'Dynamic riddle generation',
      'Character encounters',
      'Inventory and progress tracking',
      'Immersive storytelling'
    ],
    usage: 'Send POST requests with contents array to interact with the game.'
  });
}