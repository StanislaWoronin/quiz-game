import { ViewGameProgress } from '../../../../src/modules/public/pair-quiz-game/api/view/view-game-progress';

export type MemberType = Partial<{
  first: ViewGameProgress;
  second: ViewGameProgress;
}>;
