import { geminiGenerate } from '../../gemini.js';

// Singleton instance to persist across requests
let agent2Instance = null;

export class Agent2 {
  constructor() {
    this.name = 'agent2';
    this.diaryEntries = new Map(); // Store diary entries by user ID
    console.log('Agent2 instance created');
  }
  
  async respond(contents) {
    const systemPrompt = `You are a wise, experienced mentor who provides thoughtful guidance and perspective.
        Setting: A quiet study or library; calm, reflective atmosphere conducive to deep thinking.
        Participants: Trusted advisor with years of experience; share wisdom through stories and principles; help users see the bigger picture.
        Ends: Help the user gain clarity, develop critical thinking, and make informed decisions; provide perspective that comes from experience.
        Act Sequence: Measured, thoughtful responses; ask probing questions; share relevant experiences or principles; encourage reflection.
        Key: Wise, patient, and insightful.
        Instrumentalities: Use metaphors from nature, history, and classic wisdom; occasional thoughtful pauses; questions that promote self-discovery.
        Norms: Avoid prescriptive advice; guide rather than command; respect the user's autonomy; acknowledge complexity and nuance.
        Genre: Thoughtful dialogue, Socratic questioning, wisdom-sharing, reflective coaching.`;

    const { text } = await geminiGenerate({ contents, systemPrompt });
    return { text };
  }

  // Handle diary entry collection
  async addDiaryEntry(userId, entry, date) {
    if (!this.diaryEntries.has(userId)) {
      this.diaryEntries.set(userId, []);
    }
    
    const userEntries = this.diaryEntries.get(userId);
    
    // Always add a new entry (don't check for existing entries by date)
    // This allows multiple entries per day for testing
    const timestamp = Date.now();
    userEntries.push({ 
      date, 
      content: entry, 
      timestamp,
      entryId: `entry_${timestamp}`
    });
    
    console.log(`Added diary entry. Total entries now: ${userEntries.length}`);
    
    return { success: true, totalEntries: userEntries.length };
  }

  // Get diary entries for a user
  getDiaryEntries(userId) {
    return this.diaryEntries.get(userId) || [];
  }

  // Generate weekly mentor letter
  async generateWeeklyLetter(userId, mentorPersonality = 'wise_elder') {
    const entries = this.getDiaryEntries(userId);
    
    if (entries.length === 0) {
      return { text: "I haven't received any diary entries from you yet. Please start writing your daily thoughts so I can provide you with meaningful guidance." };
    }

    const entriesText = entries.map(entry => 
      `Date: ${entry.date}\nEntry: ${entry.content}`
    ).join('\n\n');

    const mentorPrompts = {
      wise_elder: `You are a wise elder who has lived through many seasons of life. You write thoughtful, reflective letters that draw from ancient wisdom, personal experience, and deep understanding of human nature. Your letters are warm, grandfatherly, and filled with timeless insights.`,
      
      life_coach: `You are an experienced life coach who specializes in personal development and growth. Your letters are motivational, practical, and action-oriented. You provide concrete strategies, tools, and frameworks for personal improvement while being encouraging and supportive.`,
      
      philosopher: `You are a philosophical mentor who approaches life's questions with deep intellectual rigor. Your letters explore the deeper meanings behind experiences, drawing from philosophy, psychology, and the great thinkers throughout history. You help people understand the 'why' behind their experiences.`,
      
      spiritual_guide: `You are a spiritual mentor who helps people find meaning and purpose in their experiences. Your letters are contemplative, drawing from various spiritual traditions, mindfulness practices, and the search for inner peace and understanding.`,
      
      practical_advisor: `You are a practical advisor who focuses on real-world solutions and actionable advice. Your letters are straightforward, no-nonsense, and filled with practical wisdom about work, relationships, health, and daily living.`
    };

    const systemPrompt = `${mentorPrompts[mentorPersonality] || mentorPrompts.wise_elder}

    Based on the following weekly diary entries, write a thoughtful mentor letter that includes:
    1. A warm, personal greeting acknowledging their week
    2. Insights drawn from their entries about patterns, growth, or challenges
    3. Relevant quotes from famous thinkers, writers, or historical figures
    4. Historical context or examples that relate to their experiences
    5. Practical advice or perspectives that could help them
    6. Encouragement and wisdom for the week ahead
    7. A thoughtful closing

    Write this as a personal letter, not as a conversation. Make it feel like receiving wisdom from a trusted mentor.

    Weekly Diary Entries:
    ${entriesText}`;

    const { text } = await geminiGenerate({ 
      contents: [{ role: 'user', parts: [{ text: 'Generate my weekly mentor letter' }] }], 
      systemPrompt 
    });
    
    return { text };
  }

  // Clear diary entries (for new week)
  clearDiaryEntries(userId) {
    this.diaryEntries.delete(userId);
    console.log(`Cleared diary entries for user: ${userId}`);
    return { success: true };
  }

  // Debug method to check diary entries
  debugDiaryEntries(userId) {
    const entries = this.getDiaryEntries(userId);
    console.log(`Debug - User: ${userId}, Entries: ${entries.length}`);
    console.log(`Debug - All entries:`, entries);
    return entries;
  }

  // Generate a unique daily question to prompt diary writing
  generateDailyQuestion(userId) {
    const usedQuestions = this.getUsedQuestions(userId);
    
    // Curated list of thoughtful reflection questions
    const allQuestions = [
      "What small moment today reminded you of who you really are?",
      "If you could whisper one piece of advice to yourself from a year ago, what would it be?",
      "What emotion did you feel most strongly today, and where in your body did you feel it?",
      "What pattern in your life are you ready to change, and what's the first step?",
      "What conversation today made you think differently about something?",
      "If today had a color, what would it be and why?",
      "What did you learn about yourself through your interactions today?",
      "What small act of kindness did you witness or perform today?",
      "What would you tell your future self about this moment in your life?",
      "What boundary did you set or wish you had set today?",
      "What made you feel most alive today, even if just for a moment?",
      "What old belief about yourself did you question today?",
      "What did you do today that aligned with your values?",
      "What fear did you face today, big or small?",
      "What would you do differently if you could relive today?",
      "What made you feel grateful today that you usually take for granted?",
      "What did you discover about your relationships today?",
      "What creative impulse did you have today, even if you didn't act on it?",
      "What did you let go of today, even if just mentally?",
      "What made you feel proud of yourself today?"
    ];
    
    // Filter out recently used questions
    const usedTexts = usedQuestions.map(q => q.question);
    const availableQuestions = allQuestions.filter(q => !usedTexts.includes(q));
    
    // If all questions have been used, reset the used questions list
    let questionsToChooseFrom = availableQuestions.length > 0 ? availableQuestions : allQuestions;
    
    // If we're resetting, clear the used questions
    if (availableQuestions.length === 0) {
      this.usedQuestions.delete(userId);
      questionsToChooseFrom = allQuestions;
    }
    
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * questionsToChooseFrom.length);
    const selectedQuestion = questionsToChooseFrom[randomIndex];
    
    // Store the question as used for this user
    this.addUsedQuestion(userId, selectedQuestion);
    
    return { 
      text: selectedQuestion,
      questionId: Date.now().toString(),
      category: this.categorizeQuestion(selectedQuestion)
    };
  }

  // Track used questions to avoid repetition
  getUsedQuestions(userId) {
    if (!this.usedQuestions) {
      this.usedQuestions = new Map();
    }
    return this.usedQuestions.get(userId) || [];
  }

  addUsedQuestion(userId, question) {
    if (!this.usedQuestions) {
      this.usedQuestions = new Map();
    }
    
    if (!this.usedQuestions.has(userId)) {
      this.usedQuestions.set(userId, []);
    }
    
    const userQuestions = this.usedQuestions.get(userId);
    userQuestions.push({
      question,
      date: new Date().toISOString().split('T')[0],
      timestamp: Date.now()
    });
    
    // Keep only last 30 days of questions to avoid memory bloat
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentQuestions = userQuestions.filter(q => q.timestamp > thirtyDaysAgo);
    this.usedQuestions.set(userId, recentQuestions);
  }

  // Categorize question for better tracking
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('grateful') || lowerQuestion.includes('thankful') || lowerQuestion.includes('appreciate')) {
      return 'gratitude';
    } else if (lowerQuestion.includes('challenge') || lowerQuestion.includes('difficult') || lowerQuestion.includes('struggle')) {
      return 'challenges';
    } else if (lowerQuestion.includes('relationship') || lowerQuestion.includes('friend') || lowerQuestion.includes('family')) {
      return 'relationships';
    } else if (lowerQuestion.includes('goal') || lowerQuestion.includes('dream') || lowerQuestion.includes('future')) {
      return 'goals';
    } else if (lowerQuestion.includes('feel') || lowerQuestion.includes('emotion') || lowerQuestion.includes('mood')) {
      return 'emotions';
    } else if (lowerQuestion.includes('learn') || lowerQuestion.includes('discover') || lowerQuestion.includes('understand')) {
      return 'learning';
    } else if (lowerQuestion.includes('create') || lowerQuestion.includes('imagine') || lowerQuestion.includes('art')) {
      return 'creativity';
    } else if (lowerQuestion.includes('value') || lowerQuestion.includes('important') || lowerQuestion.includes('matter')) {
      return 'values';
    } else if (lowerQuestion.includes('grow') || lowerQuestion.includes('change') || lowerQuestion.includes('become')) {
      return 'growth';
    } else {
      return 'reflection';
    }
  }

  // Generate opening message for new users
  generateOpeningMessage(userId) {
    // Curated list of opening messages
    const openingMessages = [
      `You’ve found your way here. Good. Don’t mind the quiet—I prefer it this way. Take a seat. Each day, I’ll offer you a question—not for me, but for you. When the week is done, I’ll gather what you’ve written and share what the silence has taught me.`,

      `Welcome. No grand speeches—just gentle questions and the space to answer them. Write honestly. By week’s end, I’ll send you a letter: a few insights from an old soul who favors calm over chatter.`,

      `You’re here for reflection, not performance. Each day I’ll give you a question—something simple, but not always easy. At the end of the week, I’ll offer my perspective, drawn from quiet observation and a bit of well-worn wisdom.`,

      `Sit with me awhile. The world can be noisy, but here it’s peaceful. I’ll ask one question each day; you write what you will. Once the week settles, I’ll share a thoughtful letter: plain, honest, and a little bit zen.`
    ];
    
    // Pick a random opening message
    const randomIndex = Math.floor(Math.random() * openingMessages.length);
    const selectedOpening = openingMessages[randomIndex];
    
    // Generate the first daily question
    const questionData = this.generateDailyQuestion(userId);
    
    const fullMessage = `${selectedOpening}

Here's your first reflection question to get you started:

**"${questionData.text}"**

Take your time with this question. There's no right or wrong way to answer it - just write whatever comes to mind. This is your space to explore your thoughts and feelings.

When you're ready to write your diary entry, just start typing your response to this question.`;

    return { 
      text: fullMessage,
      questionData: questionData
    };
  }
}

// Export singleton instance
export function getAgent2Instance() {
  if (!agent2Instance) {
    agent2Instance = new Agent2();
    console.log('Created new Agent2 singleton instance');
  }
  return agent2Instance;
}

