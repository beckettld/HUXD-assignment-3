import { geminiGenerate } from '../../gemini.js';

// Singleton instance to persist across requests
let agent3Instance = null;

export class Agent3 {
  constructor() {
    this.name = 'agent3';
    this.riddleIndex = 0;
    console.log('Agent3 Riddle Realms instance created');
  }

  // Hardcoded good riddles
  getRiddle() {
    const riddles = [
        {
          riddle: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?",
          answer: "echo"
        },
        {
          riddle: "The more you take, the more you leave behind. What am I?",
          answer: "footsteps"
        },
        {
          riddle: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
          answer: "map"
        },
        {
          riddle: "What has keys but no locks, space but no room, and you can enter but not go inside?",
          answer: "keyboard"
        },
        {
          riddle: "I'm tall when I'm young and short when I'm old. What am I?",
          answer: "candle"
        },
        {
          riddle: "What comes once in a minute, twice in a moment, but never in a thousand years?",
          answer: "the letter M"
        },
        {
          riddle: "What can travel around the world while staying in the same corner?",
          answer: "stamp"
        },
        {
          riddle: "The more of this there is, the less you see. What is it?",
          answer: "darkness"
        },
        {
          riddle: "What has a heart that doesn’t beat?",
          answer: "artichoke"
        },
        {
          riddle: "What gets wetter the more it dries?",
          answer: "towel"
        },
        {
          riddle: "I’m found in socks, scarves, and mittens; and often in the paws of playful kittens. What am I?",
          answer: "yarn"
        },
        {
          riddle: "I’m light as a feather, yet the strongest person can’t hold me for long. What am I?",
          answer: "breath"
        },
        {
          riddle: "What has hands but cannot clap?",
          answer: "clock"
        },
        {
          riddle: "What has an eye but cannot see?",
          answer: "needle"
        },
        {
          riddle: "What goes up but never comes down?",
          answer: "age"
        },
        {
          riddle: "The more you take away from me, the bigger I get. What am I?",
          answer: "hole"
        },
        {
          riddle: "What has to be broken before you can use it?",
          answer: "egg"
        },
        {
          riddle: "I’m always running but never walk, sometimes murmur, sometimes talk, have a bed but never sleep. What am I?",
          answer: "river"
        },
        {
          riddle: "What has a neck but no head?",
          answer: "bottle"
        },
        {
          riddle: "I have branches but no fruit, trunk, or leaves. What am I?",
          answer: "bank"
        }
      ];
    
    const riddle = riddles[this.riddleIndex % riddles.length];
    this.riddleIndex++;
    return riddle;
  }

  async respond(contents, apiKey) {
    // If no conversation history, generate opening message
    if (!contents || contents.length === 0) {
      return await this.generateOpeningMessage('default_user', apiKey);
    }

    const systemPrompt = `You are the Riddle Realms game master. Create immersive fantasy scenes and manage riddle encounters. Always create exactly 3 sentences describing atmospheric fantasy scenes with NPCs who want to ask riddles. Be vivid and engaging.`;

    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text };
  }

  // Generate opening message for new users
  async generateOpeningMessage(userId, apiKey) {
    const systemPrompt = `You are the Riddle Realms game master. Create a natural, mystical opening scene for a new player. Generate exactly 3 sentences describing a beautiful, atmospheric fantasy area where the player begins their journey. Include an NPC encounter who wants to ask a riddle. Be vivid and engaging.`;

    const openingPrompt = `Create a mystical opening scene for a new player entering Riddle Realms. Generate exactly 3 sentences describing a natural, beautiful fantasy area where they begin their journey. Include an NPC who wants to ask a riddle. Make it atmospheric and inviting.`;

    const { text } = await geminiGenerate({ 
      contents: [{ role: 'user', parts: [{ text: openingPrompt }] }], 
      systemPrompt,
      apiKey
    });

    return { 
      text: text
    };
  }
}

// Export singleton instance
export function getAgent3Instance() {
  if (!agent3Instance) {
    agent3Instance = new Agent3();
    console.log('Created new Agent3 Riddle Realms singleton instance');
  }
  return agent3Instance;
}

