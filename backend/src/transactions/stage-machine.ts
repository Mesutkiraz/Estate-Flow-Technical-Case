export type Stage =
  | 'agreement'
  | 'earnest_money'
  | 'title_deed'
  | 'completed';

const STAGES: Stage[] = [
  'agreement',
  'earnest_money',
  'title_deed',
  'completed',
];

export class StageMachine {
  static nextStage(current: Stage): Stage | null {
    const idx = STAGES.indexOf(current);
    if (idx === -1 || idx === STAGES.length - 1) return null;
    return STAGES[idx + 1];
  }

  static canTransition(current: Stage, target: Stage): boolean {
    return StageMachine.nextStage(current) === target;
  }

  static allStages(): Stage[] {
    return [...STAGES];
  }

  static indexOf(stage: Stage): number {
    return STAGES.indexOf(stage);
  }
}
