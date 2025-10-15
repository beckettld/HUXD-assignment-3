// Judges Orchestrator: Manages the panel of historical judges
// This orchestrator coordinates all the historical judges to evaluate a hot take

import { 
  SocratesJudge, 
  LincolnJudge, 
  CurieJudge, 
  DaVinciJudge, 
  RooseveltJudge 
} from './HistoricalJudges.js';

export class JudgesOrchestrator {
  constructor() {
    this.name = 'judges_orchestrator';
    this.judges = [
      new SocratesJudge(),
      new LincolnJudge(),
      new CurieJudge(),
      new DaVinciJudge(),
      new RooseveltJudge()
    ];
    console.log('Judges Orchestrator created with 5 historical judges');
  }

  async orchestrateJudges(hotTake) {
    console.log(`Judges Orchestrator: Evaluating hot take: "${hotTake}"`);
    
    // Get responses from all judges in parallel
    const judgePromises = this.judges.map(judge => 
      judge.evaluateHotTake(hotTake).catch(error => {
        console.error(`Error from ${judge.name}:`, error);
        return { 
          text: `${judge.name} is temporarily unavailable for comment.`, 
          judge: judge.name, 
          era: judge.era 
        };
      })
    );

    const judgeResponses = await Promise.all(judgePromises);
    
    console.log(`Received responses from ${judgeResponses.length} judges`);
    
    return {
      hotTake,
      judgeResponses,
      totalJudges: this.judges.length,
      successfulResponses: judgeResponses.filter(r => r.text && !r.text.includes('temporarily unavailable')).length
    };
  }

  // Get a summary of all judges for display
  getJudgesInfo() {
    return this.judges.map(judge => ({
      name: judge.name,
      era: judge.era,
      specialty: this.getJudgeSpecialty(judge.name)
    }));
  }

  getJudgeSpecialty(judgeName) {
    const specialties = {
      'Socrates': 'Philosophy & Critical Thinking',
      'Abraham Lincoln': 'Leadership & Moral Wisdom',
      'Marie Curie': 'Science & Evidence-Based Thinking',
      'Leonardo da Vinci': 'Innovation & Creative Problem-Solving',
      'Eleanor Roosevelt': 'Human Rights & Social Justice'
    };
    return specialties[judgeName] || 'Historical Perspective';
  }
}
