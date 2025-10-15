// Orchestrator for Agent1 - Historical Judges Panel System
// This orchestrator manages the Historical Judges Panel for evaluating hot takes

import { geminiGenerate } from '../../gemini.js';
import { getAgent1Instance } from './Agent1.js';

export class Orchestrator1 {
  constructor() {
    this.name = 'orchestrator1';
    this.agent = getAgent1Instance();
    console.log('Orchestrator1 created with Historical Judges Panel system');
  }

  async orchestrate(contents, apiKey) {
    console.log('Orchestrator1: Processing with Historical Judges Panel');
    
    // Use the Historical Judges Panel system
    const response = await this.agent.respond(contents, apiKey);
    const text = response?.text || '';

    const frameSet = { 
      frames: { 
        persona: { 
          value: 'historical_judges_panel', 
          rationale: ['Historical Judges Panel - evaluating hot takes with wisdom from different eras'] 
        } 
      } 
    };

    return { 
      assistantMessage: text, 
      frameSet, 
      agent: 'agent1', 
      reasons: 'Using Historical Judges Panel - evaluating hot takes with historical perspectives' 
    };
  }
}

