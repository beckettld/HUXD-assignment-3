// Synthesizer Orchestrator: Combines responses from all agents into a cohesive answer
// This is an example of an "aggregator" or "synthesizer" pattern that incorporates aspects of all agents

import { geminiGenerate } from '../gemini.js';
import { Agent1 } from '../agents/agent1/Agent1.js';
import { Agent2 } from '../agents/agent2/Agent2.js';
import { Agent3 } from '../agents/agent3/Agent3.js';

export class SynthesizerOrchestrator {
  constructor() {
    this.name = 'synthesizer';
    this.agent1 = new Agent1();
    this.agent2 = new Agent2();
    this.agent3 = new Agent3();
  }

  async orchestrate(contents) {
    // Get responses from all three agents in parallel
    const [response1, response2, response3] = await Promise.all([
      this.agent1.respond(contents),
      this.agent2.respond(contents),
      this.agent3.respond(contents)
    ]);

    const text1 = response1?.text || '';
    const text2 = response2?.text || '';
    const text3 = response3?.text || '';

    // Synthesize the responses into a cohesive message
    const synthesisPrompt = `You are a master synthesizer who combines multiple perspectives into a cohesive, unified response.

        You have received three different responses to the same user query from three different agents:

        Agent 1 (Energetic & Encouraging): "${text1}"

        Agent 2 (Wise & Thoughtful): "${text2}"

        Agent 3 (Creative & Innovative): "${text3}"

        Your task: Create a unified response that:
        1. Incorporates the best elements from each agent's perspective
        2. Maintains a natural, conversational flow (don't explicitly mention "Agent 1 says..." or similar)
        3. Balances energy, wisdom, and creativity appropriately for the user's needs
        4. Creates a cohesive message that feels like it came from a single, well-rounded assistant
        5. Prioritizes the most relevant perspectives while acknowledging other useful angles

        Guidelines:
        - Blend perspectives naturally rather than listing them separately
        - Maintain the strengths of each agent (encouragement, wisdom, creativity) without being repetitive
        - If agents disagree or offer contrasting views, synthesize them into nuanced advice
        - Keep the response concise and actionable
        - Use a warm, balanced tone

        Generate a synthesized response that brings together these perspectives:`;

    const synthesisContents = [
      ...contents,
      { role: 'model', parts: [{ text: synthesisPrompt }] }
    ];

    const synthesisResult = await geminiGenerate({
      contents: synthesisContents,
      systemPrompt: 'You are a skilled synthesizer who creates cohesive, well-rounded responses by combining multiple perspectives.',
      config: {}
    });

    const synthesizedText = synthesisResult?.text || text1;

    const frameSet = { 
      frames: { 
        synthesis: { 
          value: 'all_agents', 
          rationale: ['Combined perspectives from agent1 (encouraging), agent2 (wise), and agent3 (creative)'] 
        } 
      } 
    };

    return { 
      assistantMessage: synthesizedText, 
      frameSet, 
      agent: 'synthesizer', 
      reasons: 'Synthesized response from all three agents' 
    };
  }
}

