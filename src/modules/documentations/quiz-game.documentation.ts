import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ViewGame } from '../public/pair-quiz-game/api/view/view-game';
import { AnswerDto } from '../public/pair-quiz-game/api/dto/answer.dto';
import { ViewAnswer } from '../public/pair-quiz-game/api/view/view-answer';
import { ViewPage } from '../../common/pagination/view-page';
import { BadRequestResponse } from '../../common/dto/errors-messages';
import { ViewUserStatistic } from '../public/pair-quiz-game/api/view/view-user-statistic';
import { GameQueryDto } from '../public/pair-quiz-game/api/dto/query/game-query.dto';
import { TopPlayersQueryDto } from '../public/pair-quiz-game/api/dto/query/top-players-query.dto';
import { ViewTopPlayers } from '../public/pair-quiz-game/api/view/view-top-players';

export function ApiJoinGame() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Connect current user to existing random pending pair or create new pair which will be waiting second player',
    }),
    ApiOkResponse({
      description:
        'Returns started existing pair or new pair with status "PendingSecondPlayer"',
      type: ViewGame,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description: 'If current user is already participating in active pair',
    }),
  );
}

export function ApiSendAnswer() {
  return applyDecorators(
    ApiOperation({
      summary: 'Send answer for next not answered question in active pair',
    }),
    ApiBody({ type: AnswerDto }),
    ApiOkResponse({
      description: 'Returns answer result',
      type: ViewAnswer,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description:
        'If current user is not inside active pair or user is in active pair but has already answered to all questions',
    }),
  );
}

export function ApiGetUserGames() {
  return applyDecorators(
    ApiOperation({ summary: 'Return all user games (current and finished)' }),
    ApiQuery({ type: GameQueryDto }),
    ApiOkResponse({
      description:
        'Returns pair by id if current user is taking part in this pair',
      type: ViewPage<ViewGame>,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function ApiGetUserCurrentGame() {
  return applyDecorators(
    ApiOperation({ summary: 'Return current unfinished user`s game' }),
    ApiOkResponse({
      description: 'Returns current pair in which current user is taking part',
      type: ViewGame,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiNotFoundResponse({
      description: 'If no active pair for current user',
    }),
  );
}

export function ApiGetGameById() {
  return applyDecorators(
    ApiOperation({ summary: 'Return game by id' }),
    ApiParam({
      name: 'gameId',
      type: 'string',
      required: true,
    }),
    ApiOkResponse({
      description: 'Returns pair by id',
      type: ViewGame,
    }),
    ApiBadRequestResponse({
      description: 'If id has invalid format',
      type: BadRequestResponse,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
    ApiForbiddenResponse({
      description:
        'If current user tries to get pair in which user is not participant',
    }),
    ApiNotFoundResponse({
      description: 'If game not found',
    }),
  );
}

export function ApiGetUserStatistic() {
  return applyDecorators(
    ApiOperation({
      description: 'Get current user statistic',
    }),
    ApiOkResponse({
      type: ViewUserStatistic,
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
    }),
  );
}

export function ApiGetTopPlayers() {
  return applyDecorators(
    ApiOperation({
      description: 'Get user`s top',
    }),
    ApiQuery({ type: TopPlayersQueryDto }),
    ApiOkResponse({
      type: ViewPage<ViewTopPlayers>,
    }),
  );
}
