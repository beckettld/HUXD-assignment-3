// Orchestrator for Agent2 - Weekly Diary Mentor System

import { geminiGenerate } from '../../gemini.js';
import { getAgent2Instance } from './Agent2.js';

export class Orchestrator2 {
  constructor() {
    this.name = 'orchestrator2';
    this.agent = getAgent2Instance();
    console.log('Orchestrator2 created with singleton Agent2 instance');
  }

  async orchestrate(contents, apiKey) {
    // Check if this is a fresh conversation (no messages yet)
    if (contents.length === 0) {
      return await this.handleOpeningMessage(contents, apiKey);
    }

    // Check if this is a diary entry or mentor letter request
    const lastMessage = contents[contents.length - 1];
    const messageText = lastMessage?.parts?.[0]?.text?.toLowerCase() || '';

    console.log(`Orchestrator: Processing message: "${messageText}"`);
    console.log(`Last message role: ${lastMessage?.role}`);

    // Handle diary entry - detect any user message that's not a system command
    if (lastMessage?.role === 'user' && 
        !messageText.includes('daily question') && 
        !messageText.includes('question for today') && 
        !messageText.includes('prompt me') && 
        !messageText.includes('what should i write') &&
        !messageText.includes('weekly letter') && 
        !messageText.includes('mentor letter') && 
        !messageText.includes('my letter') &&
        !messageText.includes('which mentor') && 
        !messageText.includes('mentor type') && 
        !messageText.includes('personality')) {
      console.log('Detected as diary entry');
      return await this.handleDiaryEntry(contents, apiKey);
    }

    // Handle mentor letter request
    if (messageText.includes('weekly letter') || messageText.includes('mentor letter') || messageText.includes('my letter')) {
      return this.handleMentorLetter(contents);
    }

    // Handle mentor personality selection
    if (messageText.includes('which mentor') || messageText.includes('mentor type') || messageText.includes('personality')) {
      return this.handleMentorSelection(contents);
    }

    // Handle daily question request
    if (messageText.includes('daily question') || messageText.includes('question for today') || messageText.includes('prompt me') || messageText.includes('what should i write')) {
      return this.handleDailyQuestion(contents);
    }

    // Handle opening message request
    if (messageText.includes('start journal') || messageText.includes('begin journal') || messageText.includes('new journal') || messageText.includes('introduce yourself') || messageText.includes('hello') || messageText.includes('hi')) {
      return this.handleOpeningMessage(contents);
    }

    // Default conversation
    console.log('Falling through to default conversation handler');
    const response = await this.agent.respond(contents, apiKey);
    const text = response?.text || '';

    const frameSet = { 
      frames: { 
        persona: { 
          value: 'agent2', 
          rationale: ['Wise mentor persona'] 
        } 
      } 
    };

    return { 
      assistantMessage: text, 
      frameSet, 
      agent: 'agent2', 
      reasons: 'Using agent2 - wise mentor' 
    };
  }

  async handleDiaryEntry(contents, apiKey) {
    const lastMessage = contents[contents.length - 1];
    const entryText = lastMessage?.parts?.[0]?.text || '';
    
    // Extract date (default to today if not provided)
    const today = new Date().toISOString().split('T')[0];
    const dateMatch = entryText.match(/(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : today;
    
    // For now, use a default user ID (in a real app, this would come from authentication)
    const userId = 'default_user';
    
    console.log(`Adding diary entry for user: ${userId}`);
    console.log(`Entry text: "${entryText}"`);
    console.log(`Date: ${date}`);
    
    const result = await this.agent.addDiaryEntry(userId, entryText, date);
    const entries = this.agent.getDiaryEntries(userId);
    
    console.log(`Diary entry added. Total entries: ${entries.length}`);
    console.log(`Entries:`, entries.map(e => ({ date: e.date, content: e.content.substring(0, 50) + '...' })));
    
    // Debug: Check all entries for this user
    this.agent.debugDiaryEntries(userId);
    
    let response;
    
    // For testing, generate letter after 3 entries instead of 7
    console.log(`Checking if entries.length (${entries.length}) >= 3`);
    if (entries.length >= 3) {
      console.log('Generating mentor letter...');
      // Generate mentor letter automatically when 3 entries are reached
      const mentorPersonality = await this.selectMentorPersonality(entries);
      const letterResponse = await this.agent.generateWeeklyLetter(userId, mentorPersonality, apiKey);
      
      const mentorNames = {
        wise_elder: 'Marcus Aurelius',
        life_coach: 'Maya Angelou', 
        philosopher: 'Carl Jung',
        spiritual_guide: 'Thich Nhat Hanh',
        practical_advisor: 'Benjamin Franklin'
      };
      
      const mentorName = mentorNames[mentorPersonality] || 'Marcus Aurelius';
      
      response = `You've completed a full week of reflection. Here is your message from ${mentorName}:

---

${letterResponse.text}

---

Your week of reflection is complete. Feel free to start a new week whenever you're ready.`;
    } else {
      console.log(`Generating new question. Entries: ${entries.length}, Remaining: ${3 - entries.length}`);
      // Generate a new daily question for the next day
      const questionData = await this.agent.generateDailyQuestion(userId, apiKey);
      
      response = `Noted. Come back tomorrow and respond to this question or write about whatever you feel like when you're ready:

**"${questionData.text}"**

You have ${3 - entries.length} more entries to complete your week.`;
    }

    const frameSet = { 
      frames: { 
        persona: { 
          value: entries.length >= 3 ? 'mentor_letter' : 'diary_collector', 
          rationale: entries.length >= 3 ? ['Generated weekly mentor letter'] : ['Collecting daily diary entries'] 
        } 
      } 
    };

    return { 
      assistantMessage: response, 
      frameSet, 
      agent: 'agent2', 
      reasons: entries.length >= 7 ? 'Generated weekly mentor letter' : 'Diary entry collected' 
    };
  }

  async handleMentorLetter(contents) {
    const userId = 'default_user';
    const entries = this.agent.getDiaryEntries(userId);
    
    if (entries.length === 0) {
      return {
        assistantMessage: "You haven't written any diary entries yet. Please start with daily entries before I can generate your mentor letter.",
        frameSet: { frames: { persona: { value: 'mentor', rationale: ['No entries to analyze'] } } },
        agent: 'agent2',
        reasons: 'No diary entries available'
      };
    }

    // Analyze entries to determine best mentor personality
    const mentorPersonality = await this.selectMentorPersonality(entries);
    
    const response = await this.agent.generateWeeklyLetter(userId, mentorPersonality);
    
    const frameSet = { 
      frames: { 
        persona: { 
          value: mentorPersonality, 
          rationale: [`Selected ${mentorPersonality} based on diary analysis`] 
        } 
      } 
    };

    return { 
      assistantMessage: response.text, 
      frameSet, 
      agent: 'agent2', 
      reasons: `Generated mentor letter using ${mentorPersonality} personality` 
    };
  }

  async handleMentorSelection(contents) {
    const mentorOptions = [
      'wise_elder - A grandfatherly figure with timeless wisdom',
      'life_coach - Motivational and action-oriented guidance', 
      'philosopher - Deep intellectual exploration of life\'s questions',
      'spiritual_guide - Contemplative and meaning-focused guidance',
      'practical_advisor - Straightforward, real-world solutions'
    ];

    const response = `I can connect you with different types of mentors, each with their own unique perspective:

${mentorOptions.map((option, index) => `${index + 1}. ${option}`).join('\n')}

Which mentor resonates with you, or would you like me to analyze your diary entries and recommend the best mentor for your current situation?`;

    const frameSet = { 
      frames: { 
        persona: { 
          value: 'mentor_selector', 
          rationale: ['Presenting mentor options'] 
        } 
      } 
    };

    return { 
      assistantMessage: response, 
      frameSet, 
      agent: 'agent2', 
      reasons: 'Presenting mentor selection options' 
    };
  }

  async selectMentorPersonality(entries) {
    // Analyze diary entries to determine the best mentor personality
    const entriesText = entries.map(entry => entry.content).join(' ');
    
    const analysisPrompt = `Analyze the following diary entries and determine which mentor personality would be most helpful:

Mentor Options:
- wise_elder: For reflection, life wisdom, and emotional support
- life_coach: For motivation, goal-setting, and personal development  
- philosopher: For deep thinking, existential questions, and intellectual exploration
- spiritual_guide: For meaning, purpose, and inner peace
- practical_advisor: For concrete problems, daily challenges, and actionable solutions

Diary Entries: ${entriesText}

Respond with just the mentor personality name (e.g., "wise_elder").`;

    try {
      const { text } = await geminiGenerate({ 
        contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
        systemPrompt: 'You are an expert at matching people with the right mentor based on their expressed needs and writing patterns.'
      });
      
      const selectedMentor = text.trim().toLowerCase();
      const validMentors = ['wise_elder', 'life_coach', 'philosopher', 'spiritual_guide', 'practical_advisor'];
      
      return validMentors.includes(selectedMentor) ? selectedMentor : 'wise_elder';
    } catch (error) {
      console.error('Error selecting mentor personality:', error);
      return 'wise_elder'; // Default fallback
    }
  }

  handleDailyQuestion(contents) {
    const userId = 'default_user';
    
    try {
      const questionData = this.agent.generateDailyQuestion(userId);
      
      const response = `Here's your daily reflection question to get you started:

**"${questionData.text}"**

Take your time with this question. There's no right or wrong way to answer it - just write whatever comes to mind. This is your space to explore your thoughts and feelings.

When you're ready to write your diary entry, just start typing your response to this question.`;

      const frameSet = { 
        frames: { 
          persona: { 
            value: 'question_generator', 
            rationale: [`Generated ${questionData.category} question for daily reflection`] 
          } 
        } 
      };

      return { 
        assistantMessage: response, 
        frameSet, 
        agent: 'agent2', 
        reasons: `Generated daily ${questionData.category} question` 
      };
    } catch (error) {
      console.error('Error generating daily question:', error);
      
      const fallbackResponse = `Here's a question to inspire your diary entry today:

**"What moment from today made you pause and think differently about something?"**

Feel free to explore this question in your diary entry, or write about whatever is on your mind.`;

      const frameSet = { 
        frames: { 
          persona: { 
            value: 'question_generator', 
            rationale: ['Generated fallback question due to error'] 
          } 
        } 
      };

      return { 
        assistantMessage: fallbackResponse, 
        frameSet, 
        agent: 'agent2', 
        reasons: 'Generated fallback daily question' 
      };
    }
  }

  async handleOpeningMessage(contents, apiKey) {
    const userId = 'default_user';
    
    try {
      const openingData = await this.agent.generateOpeningMessage(userId, apiKey);
      
      const frameSet = { 
        frames: { 
          persona: { 
            value: 'journal_intro', 
            rationale: ['Generated opening message with first question'] 
          } 
        } 
      };

      return { 
        assistantMessage: openingData.text, 
        frameSet, 
        agent: 'agent2', 
        reasons: 'Generated opening message and first daily question' 
      };
    } catch (error) {
      console.error('Error generating opening message:', error);
      
      const fallbackResponse = `Welcome to your personal journal! 🌟

I'm here to be your thoughtful companion on this journey of self-discovery. Each day, I'll provide you with a unique reflection question to inspire your writing, and at the end of the week, I'll create a personalized mentor letter just for you.

Here's your first reflection question to get you started:

**"What moment from today made you pause and think differently about something?"**

Take your time with this question. There's no right or wrong way to answer it - just write whatever comes to mind. This is your space to explore your thoughts and feelings.

When you're ready to write your diary entry, just start typing your response to this question.`;

      const frameSet = { 
        frames: { 
          persona: { 
            value: 'journal_intro', 
            rationale: ['Generated fallback opening message'] 
          } 
        } 
      };

      return { 
        assistantMessage: fallbackResponse, 
        frameSet, 
        agent: 'agent2', 
        reasons: 'Generated fallback opening message' 
      };
    }
  }
}

