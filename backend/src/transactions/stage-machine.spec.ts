import { StageMachine, Stage } from './stage-machine';

describe('StageMachine', () => {
  describe('nextStage', () => {
    it('agreement → earnest_money', () => {
      expect(StageMachine.nextStage('agreement')).toBe('earnest_money');
    });

    it('earnest_money → title_deed', () => {
      expect(StageMachine.nextStage('earnest_money')).toBe('title_deed');
    });

    it('title_deed → completed', () => {
      expect(StageMachine.nextStage('title_deed')).toBe('completed');
    });

    it('completed is terminal (returns null)', () => {
      expect(StageMachine.nextStage('completed')).toBeNull();
    });
  });

  describe('canTransition', () => {
    it('allows forward step: agreement → earnest_money', () => {
      expect(StageMachine.canTransition('agreement', 'earnest_money')).toBe(true);
    });

    it('allows forward step: earnest_money → title_deed', () => {
      expect(StageMachine.canTransition('earnest_money', 'title_deed')).toBe(true);
    });

    it('allows forward step: title_deed → completed', () => {
      expect(StageMachine.canTransition('title_deed', 'completed')).toBe(true);
    });

    it('rejects skip: agreement → title_deed', () => {
      expect(StageMachine.canTransition('agreement', 'title_deed')).toBe(false);
    });

    it('rejects skip: agreement → completed', () => {
      expect(StageMachine.canTransition('agreement', 'completed')).toBe(false);
    });

    it('rejects backward: earnest_money → agreement', () => {
      expect(StageMachine.canTransition('earnest_money', 'agreement')).toBe(false);
    });

    it('rejects backward: completed → title_deed', () => {
      expect(StageMachine.canTransition('completed', 'title_deed')).toBe(false);
    });

    it('rejects same-stage transition: agreement → agreement', () => {
      expect(StageMachine.canTransition('agreement', 'agreement')).toBe(false);
    });

    it('rejects any transition from terminal: completed → completed', () => {
      expect(StageMachine.canTransition('completed', 'completed')).toBe(false);
    });
  });

  describe('allStages', () => {
    it('returns all four stages in order', () => {
      expect(StageMachine.allStages()).toEqual([
        'agreement',
        'earnest_money',
        'title_deed',
        'completed',
      ]);
    });

    it('returns a copy (mutation-safe)', () => {
      const a = StageMachine.allStages();
      a.push('hacked' as any);
      expect(StageMachine.allStages()).toHaveLength(4);
    });
  });

  describe('indexOf', () => {
    it('agreement is index 0', () => {
      expect(StageMachine.indexOf('agreement')).toBe(0);
    });
    it('completed is index 3', () => {
      expect(StageMachine.indexOf('completed')).toBe(3);
    });
  });
});
