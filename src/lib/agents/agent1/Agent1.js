import { geminiGenerate } from '../../gemini.js';
import { JudgesOrchestrator } from './JudgesOrchestrator.js';
import { JudgesSynthesizer } from './JudgesSynthesizer.js';

// Singleton instance to persist across requests
let agent1Instance = null;

export class Agent1 {
  constructor() {
    this.name = 'agent1';
    this.judgesOrchestrator = new JudgesOrchestrator();
    this.synthesizer = new JudgesSynthesizer();
    console.log('Agent1 Historical Judges instance created');
  }
  
  async respond(contents, apiKey) {
    // If no conversation history, show simple default message
    if (!contents || contents.length === 0) {
      return { text: "Say your hot take and our historical judges will put their opinions on it." };
    }

    // Check if user is providing a hot take
    const lastMessage = contents[contents.length - 1];
    const messageText = lastMessage?.parts?.[0]?.text || '';
    
    console.log(`Agent1: Processing message: "${messageText}"`);
    
    // Detect if this is a hot take (not a system command)
    if (lastMessage?.role === 'user' && 
        !messageText.toLowerCase().includes('help') && 
        !messageText.toLowerCase().includes('judges') &&
        !messageText.toLowerCase().includes('panel') &&
        !messageText.toLowerCase().includes('who are') &&
        !messageText.toLowerCase().includes('introduce')) {
      
      console.log('Detected hot take, starting evaluation process');
      return await this.evaluateHotTake(messageText, apiKey);
    }
    
    // Handle help or information requests
    if (messageText.toLowerCase().includes('help') || 
        messageText.toLowerCase().includes('judges') ||
        messageText.toLowerCase().includes('panel') ||
        messageText.toLowerCase().includes('who are') ||
        messageText.toLowerCase().includes('introduce')) {
      return await this.handleInformationRequest();
    }
    
    // Default response for other messages
    return await this.handleGeneralMessage(contents);
  }


  async evaluateHotTake(hotTake, apiKey) {
    console.log(`\n🏛️ STARTING HISTORICAL JUDGES EVALUATION 🏛️`);
    console.log(`Hot Take: "${hotTake}"`);
    console.log('='.repeat(60));
    
    try {
      // Step 1: Get responses from all judges
      console.log('Step 1: Gathering responses from historical judges...');
      const judgesData = await this.judgesOrchestrator.orchestrateJudges(hotTake, apiKey);
      
      // Step 2: Synthesize the responses
      console.log('Step 2: Synthesizing judge responses...');
      const synthesisResult = await this.synthesizer.synthesizeJudgesResponses(judgesData, apiKey);
      
      // Step 3: Format the final response
      const finalResponse = this.formatFinalResponse(hotTake, synthesisResult, judgesData);
      
      console.log('\n🎭 EVALUATION COMPLETED SUCCESSFULLY 🎭');
      console.log('='.repeat(60));
      return { text: finalResponse };
      
    } catch (error) {
      console.error('❌ Error in hot take evaluation:', error);
      return { 
        text: `I apologize, but there was an issue processing your hot take with our historical judges. Please try again, or feel free to share your thoughts in a different way.` 
      };
    }
  }

  formatFinalResponse(hotTake, synthesisResult, judgesData) {
    return `🏛️ **HISTORICAL JUDGES PANEL** 🏛️

**Your Hot Take:** "${hotTake}"

**Panel Verdict:**
${synthesisResult.synthesizedVerdict}

*The wisdom of history has spoken.* 🎭`;
  }

  async handleInformationRequest() {
    const judgesInfo = this.judgesOrchestrator.getJudgesInfo();
    
    const response = `🏛️ **Welcome to the Historical Judges Panel!** 🏛️

I'm your moderator for this unique experience where you can present your hot takes to be evaluated by a panel of historical figures from different eras and backgrounds.

**Our Distinguished Panel:**
${judgesInfo.map(judge => `• **${judge.name}** (${judge.era}) - ${judge.specialty}`).join('\n')}

**How it works:**
1. Share any hot take, controversial opinion, or bold statement
2. Our historical judges will evaluate it from their unique perspectives
3. I'll synthesize their responses into a final verdict
4. You'll receive wisdom from across the ages!

**Ready to present your hot take?** Just share your thoughts and let history be your judge! 🎭

*Note: This is a fun, educational experience that combines AI with historical perspectives. The judges' responses are generated based on their known philosophies and approaches.*`;

    return { text: response };
  }

  async handleGeneralMessage(contents) {
    const systemPrompt = `You are the moderator of the Historical Judges Panel. You help users understand how the system works and encourage them to share their hot takes for evaluation by historical figures.

    Be helpful, enthusiastic, and guide users toward sharing their hot takes. If they seem unsure, give them examples of what kinds of hot takes work well with our historical judges.`;

    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    return { text };
  }
}

// Export singleton instance
export function getAgent1Instance() {
  if (!agent1Instance) {
    agent1Instance = new Agent1();
    console.log('Created new Agent1 Historical Judges singleton instance');
  }
  return agent1Instance;
}

