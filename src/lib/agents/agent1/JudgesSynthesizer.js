// Judges Synthesizer: Combines responses from all historical judges into a final verdict
// This synthesizer takes all judge responses and creates a cohesive final evaluation

import { geminiGenerate } from '../../gemini.js';

export class JudgesSynthesizer {
  constructor() {
    this.name = 'judges_synthesizer';
  }

  async synthesizeJudgesResponses(judgesData) {
    const { hotTake, judgeResponses } = judgesData;
    
    console.log(`Synthesizer: Processing responses from ${judgeResponses.length} judges`);
    
    // Format judge responses for synthesis
    const formattedResponses = judgeResponses.map(response => 
      `**${response.judge} (${response.era}):**\n${response.text}\n`
    ).join('\n---\n\n');

    const synthesisPrompt = `You are a master synthesizer who combines the perspectives of historical judges into a final verdict.

    The user's hot take: "${hotTake}"

    Here are the responses from our panel of historical judges:

    ${formattedResponses}

    Your task: Create a final synthesized verdict that:
    1. Acknowledges the diverse perspectives from different historical eras and backgrounds
    2. Identifies common themes and areas of agreement among the judges
    3. Highlights key points of disagreement or tension
    4. Provides a balanced, thoughtful final assessment
    5. Maintains the wisdom and gravitas of the historical figures
    6. Offers practical insights that the user can act upon
    7. Concludes with a clear verdict: "The Panel's Verdict"

    Structure your response as:
    - Opening acknowledgment of the hot take
    - Summary of key themes from the judges
    - Areas of agreement and disagreement
    - The Panel's Verdict (clear conclusion)
    - Practical wisdom for moving forward

    Be respectful of all perspectives while providing a clear, actionable conclusion.`;

    const contents = [{ role: 'user', parts: [{ text: synthesisPrompt }] }];
    
    const systemPrompt = `You are an expert synthesizer who combines multiple historical perspectives into coherent, actionable wisdom. You respect the unique viewpoints of each historical figure while creating a unified, practical conclusion.`;

    const { text } = await geminiGenerate({ contents, systemPrompt });
    
    return {
      synthesizedVerdict: text,
      originalHotTake: hotTake,
      judgeCount: judgeResponses.length,
      judgeNames: judgeResponses.map(r => r.judge)
    };
  }

  // Generate a summary of the judging process
  generateProcessSummary(judgesData) {
    const { hotTake, judgeResponses, totalJudges, successfulResponses } = judgesData;
    
    return {
      hotTake,
      totalJudges,
      successfulResponses,
      successRate: `${Math.round((successfulResponses / totalJudges) * 100)}%`,
      judgesParticipated: judgeResponses.map(r => r.judge),
      processDescription: `Your hot take was evaluated by ${successfulResponses} out of ${totalJudges} historical judges from different eras and backgrounds.`
    };
  }
}
