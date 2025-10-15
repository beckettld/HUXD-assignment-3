// Router Orchestrator: Selects the most relevant agent based on user input
// This is an example of a "router" pattern that surfaces the most relevant agent's response

import { geminiGenerate } from '../gemini.js';
import { Agent1 } from '../agents/agent1/Agent1.js';
import { Agent2 } from '../agents/agent2/Agent2.js';
import { Agent3 } from '../agents/agent3/Agent3.js';

const SELECTION_SCHEMA = {
  type: 'OBJECT',
  properties: {
    agent: { type: 'STRING' },
    reasons: { type: 'STRING' }
  },
  required: ['agent']
};

export class RouterOrchestrator {
  constructor() {
    this.name = 'router';
    this.agentByName = {
      agent1: new Agent1(),
      agent2: new Agent2(),
      agent3: new Agent3()
    };
  }

  async _respondWith(agentName, contents) {
    const agent = this.agentByName[agentName] || this.agentByName.agent1;
    const res = await agent.respond(contents);
    return res?.text || '';
  }

  async orchestrate(contents) {
    // First, ask an LLM to decide which agent should respond
    const orchestratorPrompt = `Your job is to choose which agent should respond to the user right now.
        Think in two steps:
        1) What kind of support or interaction does the user need right now (e.g., encouragement, thoughtful guidance, creative brainstorming)? Prioritize the latest user message while considering prior context.
        2) Pick the agent whose voice and approach best matches that need.

        Available agents:
        - "agent1": Energetic, uplifting friend who celebrates and encourages (use for: celebrations, need for positivity, motivation)
        - "agent2": Wise mentor who provides thoughtful guidance and perspective (use for: seeking advice, complex decisions, need for wisdom)
        - "agent3": Creative innovator who excels at brainstorming and novel solutions (use for: problem-solving, creative blocks, exploring possibilities)

        ONLY USE ONE OF THESE AGENTS: "agent1", "agent2", or "agent3".

        Constraints:
        - Speak only through structured output. No extra text.
        - Choose agents only from the list above.
        - Select the single most appropriate agent for the user's current need.

        Output strictly as JSON:
        {
          "agent": "agent1",
          "reasons": "User is celebrating good news and needs warm encouragement"
        }`;

    const result = await geminiGenerate({
      contents,
      systemPrompt: orchestratorPrompt,
      config: { responseMimeType: 'application/json', responseSchema: SELECTION_SCHEMA }
    });

    let agent = 'agent1';
    let reasons = 'Defaulted to agent1';
    
    try {
      const parsed = JSON.parse(result.text || '{}');
      const selectedAgent = parsed?.agent;
      if (selectedAgent === 'agent1' || selectedAgent === 'agent2' || selectedAgent === 'agent3') {
        agent = selectedAgent;
      }
      if (parsed?.reasons) reasons = String(parsed.reasons);
    } catch (_) {}

    // Get response from the selected agent
    const text = await this._respondWith(agent, contents);

    const frameSet = { frames: { persona: { value: agent, rationale: [reasons] } } };
    return { assistantMessage: text || '', frameSet, agent, reasons };
  }
}

