// Judges Synthesizer: Combines responses from all historical judges into a final verdict
// This synthesizer takes all judge responses and creates a cohesive final evaluation

import { geminiGenerate } from '../../gemini.js';

export class JudgesSynthesizer {
  constructor() {
    this.name = 'judges_synthesizer';
  }

  async synthesizeJudgesResponses(judgesData, apiKey) {
    const { hotTake, judgeResponses } = judgesData;
    
    console.log(`Synthesizer: Processing responses from ${judgeResponses.length} judges`);
    
    // Format judge responses for synthesis
    const formattedResponses = judgeResponses.map(response => 
      `**${response.judge} (${response.era}):**\n${response.text}\n`
    ).join('\n---\n\n');

    console.log('\n🔄 SYNTHESIZING JUDGES RESPONSES 🔄');
    console.log('='.repeat(50));
    console.log('Formatted responses for synthesis:');
    console.log(formattedResponses);
    console.log('='.repeat(50));

    const synthesisPrompt = `You are a master synthesizer who combines the perspectives of historical judges into a final verdict.

    The user's hot take: "${hotTake}"

    Here are the responses from our panel of historical judges:

    ${formattedResponses}

    Your task: Create a CONCISE final verdict that:
    1. Briefly summarizes what each judge said (1-2 sentences per judge)
    2. Identifies the overall panel sentiment (agree/disagree/mixed)
    3. Provides a clear, brief conclusion

    Keep it SHORT and DIRECT. No lengthy explanations or structured formatting.`;

    const contents = [{ role: 'user', parts: [{ text: synthesisPrompt }] }];
    
    const systemPrompt = `You are an expert synthesizer who combines multiple historical perspectives into coherent, actionable wisdom. You respect the unique viewpoints of each historical figure while creating a unified, practical conclusion.`;

    const { text } = await geminiGenerate({ contents, systemPrompt, apiKey });
    
    console.log('\n✅ FINAL SYNTHESIZED VERDICT ✅');
    console.log('='.repeat(50));
    console.log(text);
    console.log('='.repeat(50));
    
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
