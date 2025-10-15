import { json } from '@sveltejs/kit';
import { Orchestrator2 } from '$lib/agents/agent2/Orchestrator2.js';

/**
 * Handle chat POST requests for Agent2 - Weekly Diary Mentor System.
 * Supports diary entries, mentor letter generation, and mentor selection.
 */
export async function POST({ request }) {
  const body = await request.json();
  const { history, action, userId, date, entry } = body || {};

  if (!Array.isArray(history)) {
    return json({ error: 'history array is required' }, { status: 400 });
  }

  try {
    const orchestrator = new Orchestrator2();
    
    // Handle specific actions
    if (action === 'add_diary_entry') {
      if (!entry) {
        return json({ error: 'Diary entry content is required' }, { status: 400 });
      }
      
      const result = await orchestrator.agent.addDiaryEntry(
        userId || 'default_user', 
        entry, 
        date || new Date().toISOString().split('T')[0]
      );
      
      return json({ 
        success: true, 
        totalEntries: result.totalEntries,
        message: `Diary entry saved. You have ${result.totalEntries} entries this week.`
      });
    }
    
    if (action === 'get_weekly_letter') {
      const response = await orchestrator.agent.generateWeeklyLetter(
        userId || 'default_user',
        body.mentorPersonality || 'wise_elder'
      );
      
      return json({ 
        success: true, 
        letter: response.text,
        mentorPersonality: body.mentorPersonality || 'wise_elder'
      });
    }
    
    if (action === 'get_diary_entries') {
      const entries = orchestrator.agent.getDiaryEntries(userId || 'default_user');
      
      return json({ 
        success: true, 
        entries,
        totalEntries: entries.length
      });
    }
    
    if (action === 'clear_diary') {
      const result = orchestrator.agent.clearDiaryEntries(userId || 'default_user');
      
      return json({ 
        success: true, 
        message: 'Diary entries cleared for new week.'
      });
    }
    
    if (action === 'get_daily_question') {
      const questionData = await orchestrator.agent.generateDailyQuestion(userId || 'default_user');
      
      return json({ 
        success: true, 
        question: questionData.text,
        questionId: questionData.questionId,
        category: questionData.category
      });
    }
    
    if (action === 'get_opening_message') {
      const openingData = await orchestrator.agent.generateOpeningMessage(userId || 'default_user');
      
      return json({ 
        success: true, 
        message: openingData.text,
        questionData: openingData.questionData
      });
    }
    
    // Default chat conversation
    const contents = history.map((m) => ({ 
      role: m.role === 'user' ? 'user' : 'model', 
      parts: [{ text: m.content }] 
    }));
    
    const { assistantMessage, frameSet, agent, reasons } = await orchestrator.orchestrate(contents);
    
    return json({ 
      assistantMessage, 
      replierInput: { frameSet, contextCount: history.length, agent, reasons } 
    });
  } catch (err) {
    const msg = String(err?.message || err || '').toLowerCase();
    if (msg.includes('gemini_api_key') || msg.includes('gemini') || msg.includes('api key')) {
      return json({ error: 'Gemini API key not found' }, { status: 400 });
    }
    return json({ error: 'Pipeline error', details: String(err?.message || err) }, { status: 500 });
  }
}

